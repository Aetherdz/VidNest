import test from 'node:test';
import assert from 'node:assert/strict';
import { tokens, radii, gradients } from '../src/theme/tokens.ts';
import { copy } from '../src/i18n/copy.ts';
import { extractUrlFromText, validatePublicHttpsUrl, formatBytes, formatDuration } from '../src/utils/urlValidator.ts';
import { VidNestClient } from '../src/api/vidnestClient.ts';

test('theme tokens match mobile design requirements', () => {
  // Sand & Terracotta Studio (ui-ux-pro-max) light tokens
  assert.equal(tokens.light.primary, '#0F172A');
  assert.equal(tokens.light.onPrimary, '#FFFFFF');
  assert.equal(tokens.light.mintBg, '#FFF1E6');
  assert.equal(tokens.light.accent, '#C2410C');
  assert.equal(tokens.light.bg, '#FAF7F2');
  assert.equal(tokens.light.surface, '#FFFFFF');
  assert.equal(tokens.light.line, '#E2DDD5');

  // Dark mode tokens
  assert.equal(tokens.dark.bg, '#0B0F19');
  assert.equal(tokens.dark.surface, '#131B2E');
  assert.equal(tokens.dark.primary, '#FB923C');
  assert.equal(tokens.dark.onPrimary, '#0B0F19');
  assert.equal(tokens.dark.mintBg, '#2A1C17');
  assert.equal(tokens.dark.accent, '#FB923C');
  assert.equal(tokens.dark.line, '#26334D');

  // Large radii (20-30px)
  assert.equal(radii.card, 28);
  assert.equal(radii.box, 30);
  assert.equal(radii.nav, 30);
  assert.equal(radii.btn, 22);
  assert.equal(radii.chip, 20);
  assert.equal(radii.thumb, 18);

  // Gradient pairs
  assert.equal(gradients.length >= 6, true);
  assert.equal(gradients[0][0], '#C2410C');
});

test('Arabic copy contains all mobile UI strings and RTL setting', () => {
  const ar = copy.ar;
  assert.equal(ar.dir, 'rtl');
  assert.equal(ar.headline, 'ماذا تريد أن تحمّل اليوم؟');
  assert.equal(ar.download, 'تنزيل');
  assert.equal(ar.startDownload, 'ابدأ التنزيل');
  assert.equal(ar.tabHome, 'الرئيسية');
  assert.equal(ar.tabDownloads, 'التنزيلات');
  assert.equal(ar.tabLibrary, 'المكتبة');
  assert.equal(ar.downloadsHint, 'تُحفظ الملفات في مجلد VidNest على جهازك.');
  assert.equal(ar.toastAdded, 'أُضيف إلى التنزيلات');
  assert.equal(ar.byAtheerium, 'By Atheerium.com');
  assert.equal(ar.byAtheeriumUrl, 'https://atheerium.com');
});

test('Platform chips accurately match supported video URLs', () => {
  const platforms = copy.ar.platforms;

  const testUrls = [
    { url: 'https://youtu.be/sample123', expectedId: 'youtube' },
    { url: 'https://www.youtube.com/watch?v=sample123', expectedId: 'youtube' },
    { url: 'https://www.tiktok.com/@creator/video/123456', expectedId: 'tiktok' },
    { url: 'https://www.instagram.com/reel/abcdef/', expectedId: 'instagram' },
    { url: 'https://x.com/tech/status/987654321', expectedId: 'x' },
    { url: 'https://twitter.com/news/status/112233', expectedId: 'x' },
  ];

  for (const { url, expectedId } of testUrls) {
    const matched = platforms.find((p) =>
      p.match.some((keyword) => url.toLowerCase().includes(keyword)),
    );
    assert.ok(matched, `Failed to match ${url}`);
    assert.equal(matched.id, expectedId, `URL ${url} did not match ${expectedId}`);
  }
});

test('Download verification enforces valid HTTPS and checks server response', async () => {
  // Reject invalid / insecure links
  assert.equal(validatePublicHttpsUrl('ftp://example.com/video.mp4').valid, false);
  assert.equal(validatePublicHttpsUrl('http://insecure.test/vid').valid, false);
  assert.equal(validatePublicHttpsUrl('https://localhost:8080/vid').valid, false);
  assert.equal(validatePublicHttpsUrl('https://192.168.1.100/vid').valid, false);

  // Valid public HTTPS link accepted
  const validCheck = validatePublicHttpsUrl('https://www.youtube.com/watch?v=atlas-trip');
  assert.equal(validCheck.valid, true);

  // Client verification check
  const calls = [];
  const mockFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/healthz')) {
      return new Response(JSON.stringify({ ok: true, service: 'vidnest-web' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.endsWith('/api/session')) {
      return new Response(JSON.stringify({ csrfToken: 'test-csrf-token' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.endsWith('/api/formats')) {
      return new Response(
        JSON.stringify({
          probeId: 'probe-xyz',
          title: 'رحلة في جبال الأطلس',
          formats: [
            { id: '1080p', hasVideo: true, height: 1080, ext: 'mp4', filesize: 75497472 },
            { id: '720p', hasVideo: true, height: 720, ext: 'mp4', filesize: 39845888 },
            { id: 'mp3', hasVideo: false, ext: 'mp3', filesize: 5242880 },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.endsWith('/api/download')) {
      return new Response(
        JSON.stringify({ file: 'atlas_trip.mp4', title: 'رحلة في جبال الأطلس' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const client = new VidNestClient('https://api.test', mockFetch);

  // 1. Check health
  const isHealthy = await client.checkHealth();
  assert.equal(isHealthy, true);

  // 2. Probe formats
  const probe = await client.probeFormats(validCheck.normalized);
  assert.equal(probe.probeId, 'probe-xyz');
  assert.equal(probe.title, 'رحلة في جبال الأطلس');
  assert.equal(probe.formats.length, 3);

  // 3. Verify format sizes and labels
  assert.equal(formatBytes(probe.formats[0].filesize), '72.0 MB');
  assert.equal(formatBytes(probe.formats[1].filesize), '38.0 MB');
  assert.equal(formatBytes(probe.formats[2].filesize), '5.0 MB');

  // 4. Download and verify file URL
  const downloadResult = await client.downloadFormat(validCheck.normalized, probe.probeId, '1080p');
  assert.equal(downloadResult.file, 'atlas_trip.mp4');
  assert.equal(downloadResult.url, 'https://api.test/files/atlas_trip.mp4');
});

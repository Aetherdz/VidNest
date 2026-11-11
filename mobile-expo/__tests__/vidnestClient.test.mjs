import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUrlFromText, validatePublicHttpsUrl, pickBestFormat, formatBytes, formatDuration } from '../src/utils/urlValidator.ts';
import { VidNestClient } from '../src/api/vidnestClient.ts';

test('extractUrlFromText extracts first HTTPS URL and trims common punctuation', () => {
  assert.equal(extractUrlFromText('Shared: https://youtu.be/abc123. then https://vimeo.com/2'), 'https://youtu.be/abc123');
  assert.equal(extractUrlFromText('nothing here'), null);
  assert.equal(extractUrlFromText('https://example.com/a_(b)'), 'https://example.com/a_(b)');
});

test('accepts common public HTTPS video hosts and strips fragments', () => {
  for (const link of ['https://youtube.com/watch?v=1#time', 'https://www.tiktok.com/@x/video/1', 'https://instagram.com/reel/a', 'https://x.com/user/status/1', 'https://www.bilibili.com/video/BV1', 'https://vimeo.com/123', 'https://soundcloud.com/a/b']) {
    const result = validatePublicHttpsUrl(link);
    assert.equal(result.valid, true, link);
    assert.equal(result.normalized.includes('#'), false);
  }
});

test('rejects non-HTTPS, local/private IPs, credentials, and non-default ports', () => {
  for (const link of ['http://youtube.com/watch?v=1', 'https://127.0.0.1', 'https://10.0.0.1', 'https://192.168.1.1', 'https://169.254.169.254', 'https://100.64.0.1', 'https://172.20.0.1', 'https://0.0.0.0', 'https://localhost', 'https://user:pass@example.com', 'https://example.com:8443', 'https://service.local', 'https://host.internal', 'https://[::1]', 'https://[fd00::1]', 'https://[fe80::1]']) {
    assert.equal(validatePublicHttpsUrl(link).valid, false, link);
  }
  assert.equal(validatePublicHttpsUrl('https://example.com:443/a').valid, true);
});

const formats = [
  { id: 'v1080', hasVideo: true, height: 1080, ext: 'webm', filesize: 5000 },
  { id: 'v720', hasVideo: true, height: 720, ext: 'mp4', filesize: 3000 },
  { id: 'v480', hasVideo: true, height: 480, ext: 'mp4', filesize: 2000 },
  { id: 'awebm', hasVideo: false, ext: 'webm', filesize: 900 },
  { id: 'am4a', hasVideo: false, ext: 'm4a', filesize: 700 },
  { id: 'amp3', hasVideo: false, ext: 'mp3', filesize: 600 },
];

test('picks top video, preferred audio-only, and best resolution under cap', () => {
  assert.equal(pickBestFormat(formats, 'video').id, 'v1080');
  assert.equal(pickBestFormat(formats, 'audio').id, 'am4a');
  assert.equal(pickBestFormat(formats, 720).id, 'v720');
  assert.equal(pickBestFormat(formats, 600).id, 'v480');
});

test('formats byte counts and durations', () => {
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(5 * 1024 ** 2), '5.0 MB');
  assert.equal(formatBytes(null), '—');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3661), '1:01:01');
  assert.equal(formatDuration(undefined), '—');
});

test('quickDownload performs session, probe, best format selection and direct file URL', async () => {
  const calls = [];
  const mockFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/api/session')) return new Response(JSON.stringify({ csrfToken: 'csrf-123' }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url.endsWith('/api/formats')) return new Response(JSON.stringify({ probeId: 'probe-1', formats }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url.endsWith('/api/download')) return new Response(JSON.stringify({ file: 'clip video.mp4', title: 'Clip' }), { status: 200, headers: { 'content-type': 'application/json' } });
    throw new Error(`Unexpected URL ${url}`);
  };
  const client = new VidNestClient('https://api.example.test/', mockFetch);
  const result = await client.quickDownload('https://youtube.com/watch?v=1', 720, { direct: false });
  assert.equal(result.chosenFormat.id, 'v720');
  assert.equal(result.file, 'clip video.mp4');
  assert.equal(result.url, 'https://api.example.test/files/clip%20video.mp4');
  assert.deepEqual(calls.map((call) => new URL(call.url).pathname), ['/api/session', '/api/formats', '/api/download']);
  assert.equal(calls[1].options.headers['X-VidNest-CSRF'], 'csrf-123');
  assert.deepEqual(JSON.parse(calls[2].options.body), { url: 'https://youtube.com/watch?v=1', probeId: 'probe-1', formatId: 'v720' });
});

test('quickDownload uses /api/quick-download directly when available', async () => {
  const calls = [];
  const mockFetch = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/api/session')) return new Response(JSON.stringify({ csrfToken: 'csrf-quick' }), { status: 200, headers: { 'content-type': 'application/json' } });
    if (url.endsWith('/api/quick-download')) return new Response(JSON.stringify({ file: 'quick clip.mp4', title: 'Quick Clip' }), { status: 200, headers: { 'content-type': 'application/json' } });
    throw new Error(`Unexpected URL ${url}`);
  };
  const client = new VidNestClient('https://api.example.test/', mockFetch);
  const result = await client.quickDownload('https://youtube.com/watch?v=1', 720);
  assert.equal(result.file, 'quick clip.mp4');
  assert.equal(result.title, 'Quick Clip');
  assert.equal(result.url, 'https://api.example.test/files/quick%20clip.mp4');
  assert.deepEqual(calls.map((call) => new URL(call.url).pathname), ['/api/session', '/api/quick-download']);
  assert.equal(calls[1].options.headers['X-VidNest-CSRF'], 'csrf-quick');
  assert.deepEqual(JSON.parse(calls[1].options.body), { url: 'https://youtube.com/watch?v=1', mode: 720 });
});

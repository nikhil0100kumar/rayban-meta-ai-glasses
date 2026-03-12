const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Clean frames directory
const framesDir = path.join(__dirname, 'frames');
if (fs.existsSync(framesDir)) {
    fs.readdirSync(framesDir).forEach(f => fs.unlinkSync(path.join(framesDir, f)));
} else {
    fs.mkdirSync(framesDir);
}

// Step 1: Get video info
console.log('Analyzing meta.mp4...');
try {
    const info = execSync(`"${ffmpeg}" -i meta.mp4 -f null - 2>&1`, { encoding: 'utf8', shell: true });
    console.log(info);
} catch (e) {
    // ffmpeg writes info to stderr, which causes exit code 1
    const stderr = e.stderr || e.stdout || '';
    console.log('Video info:', stderr.split('\n').filter(l => l.includes('Duration') || l.includes('Video') || l.includes('Stream')).join('\n'));
}

// Step 2: Extract frames
// Target: ~200 frames. Video is roughly 16-17 seconds. 200/17 ≈ 12 fps
const targetFps = 12;
console.log(`\nExtracting frames at ${targetFps} fps...`);

const cmd = `"${ffmpeg}" -i meta.mp4 -vf "fps=${targetFps},scale=1920:-1" -c:v libwebp -quality 80 "frames/frame_%04d.webp"`;
console.log('Running:', cmd);

try {
    execSync(cmd, { encoding: 'utf8', stdio: 'inherit', shell: true });
} catch (e) {
    console.error('Frame extraction error:', e.message);
}

// Count extracted frames
const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.webp'));
console.log(`\nDone! Extracted ${frameFiles.length} frames to frames/ directory.`);

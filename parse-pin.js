const fs = require('fs');

if (fs.existsSync('pin.html')) {
  const html = fs.readFileSync('pin.html', 'utf8');
  console.log('HTML Length:', html.length);
  
  // Look for JSON or pin data
  const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log('Found script tags:', scriptTags.length);
  for (const tag of scriptTags) {
    if (tag.includes('550213279497340614') || tag.includes('video') || tag.includes('title') || tag.includes('description')) {
      if (tag.includes('initialData') || tag.includes('props') || tag.includes('relay')) {
        console.log('Found relevant script tag length:', tag.length);
        // Find title, description, or images
        const m = tag.match(/"title":"([^"]+)"/g);
        if (m) console.log('Titles:', m.slice(0, 5));
        const d = tag.match(/"description":"([^"]+)"/g);
        if (d) console.log('Descriptions:', d.slice(0, 5));
        const v = tag.match(/"url":"([^"]+\.mp4[^"]*)"/g);
        if (v) console.log('Videos:', v.slice(0, 3));
        const img = tag.match(/"url":"([^"]+\.jpg[^"]*)"/g);
        if (img) console.log('Images:', img.slice(0, 5));
      }
    }
  }

  // Also search for meta tags
  const metas = html.match(/<meta[^>]+>/gi) || [];
  for (const m of metas) {
    if (m.includes('og:') || m.includes('description') || m.includes('title')) {
      console.log('Meta:', m);
    }
  }
} else {
  console.log('pin.html does not exist');
}

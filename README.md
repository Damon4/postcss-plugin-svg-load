# postcss-svg-load

### Usage:
```js
const postcss = require('gulp-postcss');
const postcss_svg_load = require('postcss-svg-load');

...
.pipe(postcss([
    postcss_svg_load({
        properties: ['background-image'],
        root: 'source/img'
    })
]))
...

```

### Options:
- properties: ['background-image']
- root: 'source/img'

### Input:
```css
.block {
    background-image: svg-load('some_icon.svg', fill=#fff);
}
```

### Output:
```css
.block {
    background-image: url(data:image/svg+xml;base64,...);
}
```

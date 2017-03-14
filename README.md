# postcss-svg-load

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
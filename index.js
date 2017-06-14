const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const cheerio = require('cheerio');
const valueParser = require('postcss-value-parser');

const postcss_svg_load = require('postcss').plugin('postcss-svg-load', function (options) {

    options = options || {};

    const svgo = new SVGO({
        removeViewBox: false
    });

    if(!path.isAbsolute(options.root)) {
        options.root = path.join(process.cwd(), options.root);
    }

    function declareProceed(decl) {

        return new Promise(function (resolve, reject) {
            try {
                let parsed_value = valueParser(decl.value).nodes;

                let node = parsed_value.filter(function (node) {
                    return node.value == 'svg-load';
                })[0];

                let image = node.nodes[0].value;
                if (image.indexOf('.svg') === -1) {
                    image = image + '.svg';
                }

                let fill = node.nodes.find(function (_node) {
                    return _node.type == 'word' && _node.value.indexOf('fill=') !== -1;
                });

                if (typeof fill !== 'undefined') {
                    if (fill.value.indexOf(':') !== -1) {
                        fill = fill.value.split(':').pop()
                    } else if (fill.value.indexOf('=') !== -1) {
                        fill = fill.value.split('=').pop()
                    }
                }

                fs.readFile(path.join(options.root, image), {encoding: 'utf-8'}, function (error, svg) {
                    if (error) throw Error(error);

                    svgo.optimize(svg, function (result) {
                        if (result.error) {
                            throw Error(result.error);
                        }

                        let data = result.data;

                        if (fill) {
                            let dom = cheerio.load(data, {
                                normalizeWhitespace: true,
                                xmlMode: true
                            });

                            dom('[fill]').each(function (i, el) {
                                dom(this).attr('fill', fill);
                            });

                            data = dom.html();
                        }

                        decl.value = `url(data:image/svg+xml;base64,${new Buffer(data).toString('base64')})`;

                        resolve();
                    });
                });

            } catch (error) {
                reject(error);
            }
        })
    }

    return function (root) {

        const promises = [];

        options.properties.forEach(function (prop) {
            root.walkDecls(prop, function (decl) {
                if (decl.value.indexOf('svg-load(') !== -1) {
                    promises.push(declareProceed(decl))
                }
            });
        });

        return Promise.all(promises);
    }
});

exports = module.exports = postcss_svg_load;

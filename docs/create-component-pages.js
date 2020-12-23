var components = [
    ['input', 'boolean-input'],
    ['input', 'button'],
    ['input', 'numeric-input'],
    ['input', 'select-input'],
    ['input', 'slider-input'],
    ['input', 'text-area-input'],
    ['input', 'text-input'],
    ['input', 'vector-input'],
    ['text', 'code'],
    ['text', 'info-box'],
    ['text', 'label'],
    ['layout', 'container'],
    ['layout', 'divider'],
    ['layout', 'overlay'],
    ['layout', 'panel'],
    ['misc', 'progress'],
    ['misc', 'spinner'],
    ['input', 'context-menu']
];

var createUpperName = (name) => {
    var nameparts = name.split('-');
    var result = '';
    nameparts.forEach(part => {
        result = result + part.substring(0, 1).toUpperCase() + part.substring(1, part.length);
    });
    return result;
};

components.forEach(item => {
    var group = item[0];
    var name = item[1];
    var upperName = createUpperName(name);
    var lowerName = upperName.toLowerCase();
    var string = `---
layout: page
title: ${upperName} 
permalink: /components/${name}/
parent: Components
---
<iframe src="/pcui/storybook/iframe.html?id=${group}-${lowerName}--main&viewMode=docs" style="height: 100% !important;" class="component-iframe" onload="resize()"></iframe>

<script>
function resize() {
    var iframe = document.querySelector('.component-iframe');
    iframe.setAttribute('style', 'height: ' + iframe.contentDocument.body.offsetHeight + 'px !important; opacity: 1;');
    iframe.contentDocument.querySelector('.sbdocs-wrapper').setAttribute('style', 'padding-top: 20px;');
}
</script>`;

    fs = require('fs');
    fs.writeFile(`pages/4-components/${upperName}.markdown`, string, function (err) {
    if (err) return console.log(err);
    console.log(`written ${upperName}.markdown`);
    });
});
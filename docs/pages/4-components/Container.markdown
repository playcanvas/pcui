---
layout: page
title: Container 
permalink: /components/container/
parent: Components
---
<iframe src="/pcui/storybook/iframe.html?id=layout-container--main&viewMode=docs" style="height: 100% !important;" class="component-iframe" onload="resize()"></iframe>

<script>
function resize() {
    var iframe = document.querySelector('.component-iframe');
    iframe.setAttribute('style', 'height: ' + iframe.contentDocument.body.offsetHeight + 'px !important; opacity: 1;');
    iframe.contentDocument.querySelector('.sbdocs-wrapper').setAttribute('style', 'padding-top: 20px;');
}
</script>
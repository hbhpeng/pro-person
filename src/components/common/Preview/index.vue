<script setup lang="ts">
import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import { t } from '@/locales'
import { ss } from '@/utils/storage'

const markdown = ref('')

markdown.value = ss.get('local_copy_text')
// navigator.clipboard.readText().then((text) => {
//   markdown.value = text
// }, () => {
// })

function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

const mdi = new MarkdownIt({
  html: true,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})
mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })
const downloadContent = () => {
  const htmlText = `<div style="padding: 15px;" class='markdown-body'>${mdi.render(markdown.value)}</div>`
  html2pdf().set({ pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } }).from(htmlText).save()
}
</script>

<template>
  <div class="container">
    <button class="download" @click="downloadContent">
      下载为pdf
    </button>
    <textarea id="content" v-model="markdown" name="" cols="30" rows="1" />
  </div>
</template>

<style>
.container {
padding: 20px;
height: 100%;
width: 100%;
}
.download {
border-radius: 5px;
width: 100px;
height: 30px;
color: black;
background-color: #6AA1E7;
}
#content {
display: block;
padding: 10px;
border: 2px solid #6AA1E7;
width: 100%;
height: 80%;
min-height: 400px;
margin-top: 20px;
white-space: pre-wrap;
}
</style>

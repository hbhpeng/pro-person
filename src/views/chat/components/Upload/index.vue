<script lang="ts">
import { reactive, toRefs } from 'vue'
import {
  useMessage,
} from 'naive-ui'
import {
  uploadQuestionFile,
} from '@/api'
import { getQAFileName, setQAFileName } from '@/store/modules/chat/helper'
// import fs from 'fs'

export default {
  setup(props, context) {
    const state = reactive({
      file: '',
      uploading: false,
      error: '',
      success: '',
      exsitFile: '',
    })

    const ms = useMessage()
    const filename = getQAFileName()
    if (filename)
      state.exsitFile = filename

    const handleFileChange = (event: any) => {
      state.file = event.target.files[0]
    }

    const uploadFile = async () => {
      if (!state.file) {
        ms.error('请选择文件')
        return
      }
      const size = (state.file as any).size
      if (size > 1 * 1024 * 1024) {
        ms.error('文件大小不得超过1M')
        return
      }

      state.uploading = true

      try {
        // const formData = new FormData()
        // formData.append('file', state.file)
        const { data } = await uploadQuestionFile(state.file)
        const filename = (state.file as any).name
        setQAFileName(filename)
        state.exsitFile = filename
        state.success = '上传成功'
        state.error = ''

        context.emit('receiveMessage', data)
      }
      catch (error) {
        state.error = '上传失败'
        state.success = ''
      }
      finally {
        state.uploading = false
      }
    }

    const reUploadFile = () => {
      state.exsitFile = ''
      setQAFileName('')
    }

    return {
      ...toRefs(state),
      handleFileChange,
      uploadFile,
      reUploadFile,
    }
  },
}
</script>

<template>
  <div class="upload-container">
    <span style="font-size: 12px;">请保证文件文字可读，并且不超过1M。同时还要保证剩余字数大于1万</span>
    <div v-if="exsitFile" class="exist-file-container">
      <span class="file-span">{{ exsitFile }}</span>
      <button class="upload-bt" @click="reUploadFile">
        重新上传
      </button>
    </div>
    <div v-else class="file-upload">
      <input ref="fileInput" class="file-input" type="file" @change="handleFileChange">
      <button v-if="file" class="upload-bt" :disabled="uploading" @click="uploadFile">
        上传
      </button>
      <span v-if="uploading" class="file-span">正在上传...</span>
      <span v-if="error && !uploading" class="file-span">{{ error }}</span>
      <span v-if="success && !uploading" class="file-span">{{ success }}</span>
    </div>
  </div>
</template>

<style>
.upload-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
margin-bottom: 10px;
padding: 0px;
}

.exist-file-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100px;
width: 100%;
border: 2px dashed #ccc;
padding: 20px;
}

.file-upload {
display: flex;
flex-direction: row;
align-items: center;
justify-content: center;
height: 200px;
width: 100%;
border: 2px dashed #ccc;
padding: 20px;
}

.file-input {
/* display: none; */
box-sizing: border-box;
min-width: 100px;
}

.upload-bt {
margin: 10px 0;
padding: 10px 20px;
border: none;
background-color: #3498db;
color: #fff;
cursor: pointer;
border-radius: 5px;
min-width: 100px;
}

.upload-bt:hover {
background-color: #2980b9;
}

.file-span {
margin-top: 10px;
}
</style>

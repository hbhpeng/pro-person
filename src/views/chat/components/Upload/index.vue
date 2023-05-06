<script lang="ts">
import { reactive, toRefs } from 'vue'
import {
  uploadQuestionFile,
} from '@/api'
import { getQAFileName, setQAFileName } from '@/store/modules/chat/helper'

export default {
  setup() {
    const state = reactive({
      file: '',
      uploading: false,
      error: '',
      success: '',
      exsitFile: '',
    })

    const filename = getQAFileName()
    if (filename)
      state.exsitFile = filename

    const handleFileChange = (event: any) => {
      state.file = event.target.files[0]
    }

    const uploadFile = async () => {
      if (!state.file)
        return

      state.uploading = true

      try {
        // const formData = new FormData()
        // formData.append('file', state.file)

        const { data } = await uploadQuestionFile(state.file)
        setQAFileName(state.file)
        state.success = '上传成功'
      }
      catch (error) {
        state.error = '上传失败'
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
    }
  },
}
</script>

<template>
  <div class="container">
    <div v-if="exsitFile" class="exist-file-container">
      <span class="file-span">{{ exsitFile }}</span>
      <button v-if="file" class="upload-bt" @click="reUploadFile">
        重新上传
      </button>
    </div>
    <div v-else class="file-upload">
      <input ref="fileInput" class="file-input" type="file" @change="handleFileChange">
      <button v-if="file" class="upload-bt" @click="uploadFile">
        上传
      </button>
      <span v-if="uploading" class="file-span">正在上传...</span>
      <span v-if="error" class="file-span">{{ error }}</span>
      <span v-if="success" class="file-span">{{ success }}</span>
    </div>
  </div>
</template>

<style>
.container {
display: flex;
flex-direction: row;
align-items: center;
justify-content: center;
margin-bottom: 10px;
padding: 0px;
}
.exist-file-containe {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
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

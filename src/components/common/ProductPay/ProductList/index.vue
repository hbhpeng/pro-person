<script setup lang='ts'>
import {
  NBadge,
  NButton,
  NCard,
  NDivider,
  NGrid,
  NGridItem,
  NSpace,
} from 'naive-ui'

const emits = defineEmits < Emit > ()

interface Emit {
  (e: 'userWantPay', product: any): void
  (e: 'update:visible', visible: boolean): void
}
async function payProduct() {
  emits('userWantPay', '123')
}
</script>

<template>
  <div style="background-color: white; padding: 10px;">
    <NDivider>充值会员</NDivider>
    <NGrid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="15" y-gap="15">
      <NGridItem>
        <NBadge value="推荐">
          <NCard hoverable embedded>
            <div class="title">
              周会员
            </div>
            <div><span class="price">￥28</span><span class="old-price">原价：oldprice</span></div>
            <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
            <NSpace vertical>
              <div class="des-content">
                dessdsfasdfasdafasdfasdfasdddddddddddsdfasd
              </div>
              <NButton style="width: 100%;" type="primary" @click="payProduct">
                确认支付
              </NButton>
              <div class="hint-content">
                目前仅支持使用微信支付
              </div>
            </NSpace>
          </NCard>
        </NBadge>
      </NGridItem>
      <NGridItem>
        <NBadge value="">
          <NCard hoverable embedded>
            <div class="title">
              月会员
            </div>
            <div><span class="price">￥28</span><span class="old-price">原价：oldprice</span></div>
            <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
            <NSpace vertical>
              <div class="des-content">
                dessdsfasdfasdafasdfasdfasdddddddddddsdfasd
              </div>
              <NButton style="width: 100%;" type="primary" @click="payProduct">
                确认支付
              </NButton>
              <div class="hint-content">
                目前仅支持使用微信支付
              </div>
            </NSpace>
          </NCard>
        </NBadge>
      </NGridItem>
      <NGridItem>
        <NBadge value="">
          <NCard hoverable embedded>
            <div class="title">
              年会员
            </div>
            <div><span class="price">￥28</span><span class="old-price">原价：oldprice</span></div>
            <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
            <NSpace vertical>
              <div class="des-content">
                dessdsfasdfasdafasdfasdfasdddddddddddsdfasd
              </div>
              <NButton style="width: 100%;" type="primary" @click="payProduct">
                确认支付
              </NButton>
              <div class="hint-content">
                目前仅支持使用微信支付
              </div>
            </NSpace>
          </NCard>
        </NBadge>
      </NGridItem>
    </NGrid>

    <NDivider>充值字数</NDivider>
    <div style="text-align: center;margin-top: -20px;margin-bottom: 10px;">
      tips: 非会员不能充值字数哦
    </div>
    <NGrid cols="1 s:2 m:3 l:3 xl:3 2xl:3" responsive="screen" x-gap="15" y-gap="15">
      <NGridItem>
        <NBadge value="荐">
          <NCard hoverable embedded>
            <div class="title">
              20万字
            </div>
            <div><span class="price">￥28</span><span class="old-price">原价：oldprice</span></div>
            <NDivider style="margin-top: 10px;margin-bottom: 10px;" />
            <NSpace vertical>
              <div class="des-content">
                dessdsfasdfasdafasdfasdfasdddddddddddsdfasd
              </div>
              <NButton style="width: 100%;" type="primary" @click="payProduct">
                确认支付
              </NButton>
              <div class="hint-content">
                目前仅支持使用微信支付
              </div>
            </NSpace>
          </NCard>
        </NBadge>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.price {
font-size: 20px;
}

.old-price {
margin-left: 20px;
text-decoration: line-through;
}

.line-divider {
margin-top: 10px;
margin-bottom: 10px;
}

.des-content {
max-width: 200px;
}

.hint-content {
color: gray;
font-size: 10px;
}

.title {
color: blue;
}
</style>

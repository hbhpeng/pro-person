<script setup lang="ts">
import { NCard, NCol, NRow, NTabPane, NTabs } from 'naive-ui'
import FluxTrend from './FluxTrend.vue'
import VisitAmount from './VisitAmount.vue'
</script>

<template>
  <div class="mt-4">
    <NRow :gutter="24">
      <NCol :span="24">
        <NCard content-style="padding: 0;" :bordered="false">
          <NTabs type="line" size="large" :tabs-padding="20" pane-style="padding: 20px;">
            <NTabPane name="流量趋势">
              <FluxTrend />
            </NTabPane>
            <NTabPane name="访问量">
              <VisitAmount />
            </NTabPane>
          </NTabs>
        </NCard>
      </NCol>
    </NRow>
  </div>
</template>

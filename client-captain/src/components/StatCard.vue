<template>
  <el-card
    class="stat-card"
    :class="{ clickable: clickable }"
    :body-style="{ padding: '20px' }"
    @click="handleClick"
  >
    <div class="stat-header">
      <span class="stat-title">{{ title }}</span>
    </div>

    <div class="stat-value">{{ value }}</div>

    <div class="stat-footer">
      <span
        v-if="trend"
        :class="['stat-trend', trendType === 'up' ? 'trend-up' : 'trend-down']"
      >
        <el-icon>
          <Top v-if="trendType === 'up'" />
          <Bottom v-else />
        </el-icon>
        {{ trend }}
      </span>
      <span v-if="extra" class="stat-extra">{{ extra }}</span>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue';
import { Top, Bottom } from '@element-plus/icons-vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  trend: {
    type: String,
    default: ''
  },
  extra: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const trendType = computed(() => {
  if (props.trend && props.trend.startsWith('↑') || props.trend.includes('+')) {
    return 'up';
  }
  return 'down';
});

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};

</script>

<style scoped>
.stat-card {
  cursor: default;
}

.stat-card.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-header {
  margin-bottom: 15px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.stat-extra {
  font-size: 12px;
  color: #909399;
}
</style>

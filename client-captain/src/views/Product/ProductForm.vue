<template>
  <div class="product-form">
    <div class="page-header">
      <h2>商品管理 > {{ isEdit ? '编辑商品' : '添加商品' }}</h2>
    </div>
    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="团购价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="form.originalPrice" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="库存预警" prop="stockAlert">
          <el-input-number v-model="form.stockAlert" :min="0" />
        </el-form-item>
        <el-form-item label="佣金比例" prop="commissionRate">
          <el-input-number v-model="form.commissionRate" :precision="2" :min="0" :max="100" />
          <span style="margin-left: 10px">%</span>
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="product-uploader"
            name="image"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
          >
            <img v-if="form.image" :src="getImageUrl(form.image)" class="product-image" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 jpg、png、gif 格式，大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { getProductDetail, createProduct, updateProduct } from '@/api/product';
import { getCategoryList } from '@/api/product';

const router = useRouter();
const route = useRoute();

const formRef = ref(null);
const categories = ref([]);

const isEdit = computed(() => !!route.params.id);

// 上传配置
const uploadUrl = computed(() => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  return `${baseURL}/upload`;
});

const uploadHeaders = computed(() => {
  const token = localStorage.getItem('captain_token');
  return {
    Authorization: `Bearer ${token}`
  };
});

const form = reactive({
  name: '',
  categoryId: null,
  price: 0,
  originalPrice: 0,
  stock: 0,
  stockAlert: 10,
  commissionRate: 10,
  status: 1,
  description: '',
  image: ''
});

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入团购价格', trigger: 'blur' }],
  originalPrice: [{ required: true, message: '请输入原价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  stockAlert: [{ required: true, message: '请输入库存预警值', trigger: 'blur' }],
  commissionRate: [{ required: true, message: '请输入佣金比例', trigger: 'blur' }]
};

// 图片上传相关方法
const beforeUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传 jpg、png、gif 格式的图片!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    form.image = response.data.url;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.message || '图片上传失败');
  }
};

const handleUploadError = () => {
  ElMessage.error('图片上传失败，请重试');
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  // 处理路径
  let imagePath = path
  if (!imagePath.startsWith('/')) {
    imagePath = '/' + imagePath
  }

  // 开发环境：baseURL 是相对路径（如 /api/captain），直接返回图片路径让 Vite proxy 处理
  // 生产环境：baseURL 是完整URL（如 https://...），需要提取域名并拼接
  const baseURL = import.meta.env.VITE_API_BASE_URL

  // 如果 baseURL 是相对路径，说明是开发环境
  if (baseURL && baseURL.startsWith('/')) {
    return imagePath
  }

  // 生产环境：拼接完整URL
  if (baseURL && (baseURL.startsWith('http://') || baseURL.startsWith('https://'))) {
    // 移除 /api/captain 等后缀，只保留域名
    const serverURL = baseURL.replace(/\/api.*$/, '')
    return `${serverURL}${imagePath}`
  }

  // 兜底
  return `http://localhost:3000${imagePath}`
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (isEdit.value) {
      await updateProduct(route.params.id, form);
      ElMessage.success('更新成功');
    } else {
      await createProduct(form);
      ElMessage.success('创建成功');
    }

    router.push('/products');
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error);
    }
  }
};

const handleCancel = () => {
  router.back();
};

const fetchCategories = async () => {
  try {
    const { data } = await getCategoryList();
    categories.value = data.list || [];
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

const fetchProductDetail = async () => {
  if (!isEdit.value) return;

  try {
    const { data } = await getProductDetail(route.params.id);
    Object.assign(form, data);
  } catch (error) {
    console.error('获取商品详情失败:', error);
  }
};

onMounted(() => {
  fetchCategories();
  fetchProductDetail();
});
</script>

<style scoped>
.product-form {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.product-uploader {
  display: inline-block;
}

.product-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.product-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.product-image {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>

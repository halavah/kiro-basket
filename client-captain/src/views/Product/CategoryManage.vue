<template>
  <div class="category-manage">
    <div class="page-header">
      <h2>商品管理 > 分类管理</h2>
      <el-button type="primary" @click="handleAdd">添加分类</el-button>
    </div>

    <el-card class="category-card">
      <el-table v-loading="loading" :data="categoryList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="分类名称" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="productCount" label="商品数" width="100" align="center">
          <template #default="{ row }">
            {{ row.productCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" clearable />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getCategoryList,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/product';
import { formatDateTime } from '@/utils/date';

const loading = ref(false);
const categoryList = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref(null);

const form = reactive({
  id: null,
  name: '',
  sort: 0
});

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '分类名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ]
};

const handleAdd = () => {
  dialogTitle.value = '添加分类';
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = null;
  form.name = '';
  form.sort = 0;
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogTitle.value = '编辑分类';
  form.id = row.id;
  form.name = row.name;
  form.sort = row.sort;
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();

    if (form.id) {
      await updateCategory(form.id, {
        name: form.name,
        sort: form.sort
      });
      ElMessage.success('更新成功');
    } else {
      await createCategory({
        name: form.name,
        sort: form.sort
      });
      ElMessage.success('创建成功');
    }

    dialogVisible.value = false;
    fetchCategoryList();
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error);
    }
  }
};

const handleDialogClosed = () => {
  // 对话框关闭时重置表单
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.id = null;
  form.name = '';
  form.sort = 0;
};

const handleDelete = async (row) => {
  try {
    if (row.productCount > 0) {
      await ElMessageBox.confirm(
        `该分类下还有 ${row.productCount} 个商品，删除后这些商品将变为无分类状态，确定要删除吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
    } else {
      await ElMessageBox.confirm('确定要删除该分类吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
    }

    await deleteCategory(row.id);
    ElMessage.success('删除成功');
    fetchCategoryList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error);
    }
  }
};

const fetchCategoryList = async () => {
  try {
    loading.value = true;
    const { data } = await getCategoryList();
    categoryList.value = data.list || [];
  } catch (error) {
    console.error('获取分类列表失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategoryList();
});
</script>

<style scoped>
.category-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.category-card {
  margin-bottom: 20px;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}
</style>

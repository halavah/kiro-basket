<template>
  <div class="product-list">
    <div class="page-header">
      <h2>商品管理 > 商品列表</h2>
    </div>

    <!-- 搜索筛选区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="搜索">
          <el-input v-model="searchForm.keyword" placeholder="输入商品名" clearable />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="在售" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="product-table-card">
      <el-table v-loading="loading" :data="productList" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column label="团购价" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="原价" width="100">
          <template #default="{ row }">
            ¥{{ row.originalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" align="center">
          <template #default="{ row }">
            <span :class="row.stock < row.stockAlert ? 'text-danger' : ''">
              {{ row.stock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="80" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在售' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="primary" @click="handleAdjustStock(row)">
              调整库存
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 调整库存对话框 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="调整库存"
      width="400px"
    >
      <el-form label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="stockForm.changeType">
            <el-radio value="add">增加</el-radio>
            <el-radio value="reduce">减少</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="stockForm.quantity" :min="1" :max="9999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStockSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getProductList,
  updateProductStatus,
  updateProductStock,
  deleteProduct
} from '@/api/product';
import { getCategoryList } from '@/api/product';

const router = useRouter();

const loading = ref(false);
const productList = ref([]);
const categories = ref([]);
const stockDialogVisible = ref(false);
const currentProduct = ref(null);

const searchForm = reactive({
  keyword: '',
  categoryId: null,
  status: null
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

const stockForm = reactive({
  changeType: 'add',
  quantity: 1
});

const handleSearch = () => {
  pagination.page = 1;
  fetchProductList();
};

const handleReset = () => {
  searchForm.keyword = '';
  searchForm.categoryId = null;
  searchForm.status = null;
  handleSearch();
};

const handleAdd = () => {
  router.push('/products/add');
};

const handleEdit = (id) => {
  router.push(`/products/edit/${id}`);
};

const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1;
    await updateProductStatus(row.id, newStatus);
    ElMessage.success('操作成功');
    fetchProductList();
  } catch (error) {
    console.error('更新商品状态失败:', error);
  }
};

const handleAdjustStock = async (row) => {
  currentProduct.value = row;
  stockForm.changeType = 'add';
  stockForm.quantity = 1;
  stockDialogVisible.value = true;
};

const handleStockSubmit = async () => {
  try {
    await updateProductStock(
      currentProduct.value.id,
      stockForm.changeType,
      stockForm.quantity
    );
    ElMessage.success('库存调整成功');
    stockDialogVisible.value = false;
    fetchProductList();
  } catch (error) {
    console.error('调整库存失败:', error);
  }
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchProductList();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchProductList();
};

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await deleteProduct(row.id);
    ElMessage.success('删除成功');
    fetchProductList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error);
    }
  }
};

const fetchProductList = async () => {
  try {
    loading.value = true;
    const { data } = await getProductList({
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    });

    productList.value = data.list || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error('获取商品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const { data } = await getCategoryList();
    categories.value = data.list || [];
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

onMounted(() => {
  fetchProductList();
  fetchCategories();
});
</script>

<style scoped>
.product-list {
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

.search-card {
  margin-bottom: 20px;
}

.product-table-card {
  margin-bottom: 20px;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

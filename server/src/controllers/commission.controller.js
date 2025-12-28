const CommissionService = require('../services/commission.service');
const ResponseUtil = require('../utils/response');

/**
 * 佣金统计控制器
 */
class CommissionController {
  /**
   * 获取佣金概览
   */
  static async getCommissionOverview(req, res) {
    try {
      const captainId = req.user.id;

      const result = await CommissionService.getCommissionOverview(captainId);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取佣金概览错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取佣金明细列表
   */
  static async getCommissionList(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const { start_date, end_date } = req.query;
      const captainId = req.user.id;

      const result = await CommissionService.getCommissionList(
        captainId,
        page,
        pageSize,
        start_date,
        end_date
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取佣金明细错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 获取佣金趋势数据
   */
  static async getCommissionTrend(req, res) {
    try {
      const days = parseInt(req.query.days) || 7;
      const captainId = req.user.id;

      const result = await CommissionService.getCommissionTrend(captainId, days);

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      return ResponseUtil.success(res, result.data);
    } catch (error) {
      console.error('获取佣金趋势错误:', error);
      return ResponseUtil.serverError(res);
    }
  }

  /**
   * 导出佣金明细
   */
  static async exportCommissions(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const captainId = req.user.id;

      const result = await CommissionService.exportCommissions(
        captainId,
        start_date,
        end_date
      );

      if (!result.success) {
        return ResponseUtil.error(res, result.message);
      }

      // 设置响应头为 CSV 文件下载
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=commissions_${Date.now()}.csv`);
      res.send(result.data);
    } catch (error) {
      console.error('导出佣金明细错误:', error);
      return ResponseUtil.serverError(res);
    }
  }
}

module.exports = CommissionController;

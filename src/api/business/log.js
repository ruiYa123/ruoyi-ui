import request from '@/utils/request'

// 查询客户端操作日志列表
export function listLog(query) {
  return request({
    url: '/business/log/list',
    method: 'get',
    params: query
  })
}

// 查询客户端操作日志详细
export function getLog(id) {
  return request({
    url: '/business/log/' + id,
    method: 'get'
  })
}

// 新增客户端操作日志
export function addLog(data) {
  return request({
    url: '/business/log',
    method: 'post',
    data: data
  })
}

// 修改客户端操作日志
export function updateLog(data) {
  return request({
    url: '/business/log',
    method: 'put',
    data: data
  })
}

// 删除客户端操作日志
export function delLog(id) {
  return request({
    url: '/business/log/' + id,
    method: 'delete'
  })
}

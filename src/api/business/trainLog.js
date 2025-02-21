import request from '@/utils/request'

// 查询训练日志列表
export function listTrainLog(query) {
  return request({
    url: '/business/trainLog/list',
    method: 'get',
    params: query
  })
}

// 查询训练日志详细
export function getTrainLog(id) {
  return request({
    url: '/business/trainLog/' + id,
    method: 'get'
  })
}

// 新增训练日志
export function addTrainLog(data) {
  return request({
    url: '/business/trainLog',
    method: 'post',
    data: data
  })
}

// 修改训练日志
export function updateTrainLog(data) {
  return request({
    url: '/business/trainLog',
    method: 'put',
    data: data
  })
}

// 删除训练日志
export function delTrainLog(id) {
  return request({
    url: '/business/trainLog/' + id,
    method: 'delete'
  })
}

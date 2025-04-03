import request from '@/utils/request'

// 查询任务训练列表
export function listTrain(query) {
  return request({
    url: '/business/train/list',
    method: 'get',
    params: query
  })
}

// 查询任务训练详细
export function getTrain(id) {
  return request({
    url: '/business/train/' + id,
    method: 'get'
  })
}

export function getTrainDetail(id) {
  return request({
    url: '/business/train/getTrainDetail/' + id,
    method: 'get'
  })
}

// 新增任务训练
export function addTrain(data) {
  return request({
    url: '/business/train',
    method: 'post',
    data: data
  })
}

// 修改任务训练
export function updateTrain(data) {
  return request({
    url: '/business/train',
    method: 'put',
    data: data
  })
}

// 删除任务训练
export function delTrain(id) {
  return request({
    url: '/business/train/' + id,
    method: 'delete'
  })
}

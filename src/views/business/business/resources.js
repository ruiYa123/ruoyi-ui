import request from '@/utils/request'

// 查询资源列表
export function listResources(query) {
  return request({
    url: '/business/resources/list',
    method: 'get',
    params: query
  })
}

// 查询资源详细
export function getResources(id) {
  return request({
    url: '/business/resources/' + id,
    method: 'get'
  })
}

// 新增资源
export function addResources(data) {
  return request({
    url: '/business/resources',
    method: 'post',
    data: data
  })
}

// 修改资源
export function updateResources(data) {
  return request({
    url: '/business/resources',
    method: 'put',
    data: data
  })
}

// 删除资源
export function delResources(id) {
  return request({
    url: '/business/resources/' + id,
    method: 'delete'
  })
}

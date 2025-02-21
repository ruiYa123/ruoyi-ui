import request from '@/utils/request'

// 查询客户端列表
export function listClient(query) {
  return request({
    url: '/business/client/list',
    method: 'get',
    params: query
  })
}

export function listAllClient(query) {
  return request({
    url: '/business/client/listAll',
    method: 'get',
    params: query
  })
}

// 查询客户端详细
export function getClient(id) {
  return request({
    url: '/business/client/' + id,
    method: 'get'
  })
}

export function getClientStatus(name) {
  return request({
    url: '/business/client/status/' + name,
    method: 'get'
  })
}

// 新增客户端
export function addClient(data) {
  return request({
    url: '/business/client',
    method: 'post',
    data: data
  })
}

export function sendCommandToClient(data) {
  return request({
    url: '/business/client/sendMessage',
    method: 'post',
    data: data
  })
}

// 修改客户端
export function updateClient(data) {
  return request({
    url: '/business/client',
    method: 'put',
    data: data
  })
}

// 删除客户端
export function delClient(id) {
  return request({
    url: '/business/client/' + id,
    method: 'delete'
  })
}

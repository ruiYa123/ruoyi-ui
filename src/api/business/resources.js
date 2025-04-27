import request from '@/utils/request'

// 查询资源列表
export function listResources(query) {
  return request({
    url: '/business/resources/list',
    method: 'get',
    params: query
  })
}

export function listImages(query) {
  return request({
    url: '/business/resources/imagelist',
    method: 'get',
    params: query
  })
}

export function getImage(path) {
  return request({
    url: '/business/resources/getImage/' + path,
    method: 'get'
  })
}

export function listAll(query) {
  return request({
    url: '/business/resources/listAll',
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
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 600000
  });
}


// 修改资源
export function updateResources(data) {
  return request({
    url: '/business/resources',
    method: 'put',
    data: data,
    timeout: 600000
  })
}

// 删除资源
export function delResources(data) {
  return request({
    url: '/business/resources/delete',
    method: 'post',
    data: data
  })
}

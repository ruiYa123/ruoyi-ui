import request from '@/utils/request'

// 查询任务列表
export function listAssignment(query) {
  return request({
    url: '/business/assignment/list',
    method: 'get',
    params: query
  })
}

export function listAllAssignment(query) {
  return request({
    url: '/business/assignment/listAll',
    method: 'get',
    params: query
  })
}

export function getProcessChart(projectName, assignmentName) {
  return request({
    url: '/business/assignment/' + projectName + '/' + assignmentName,
    method: 'get'
  })
}

export function listTraining(query) {
  return request({
    url: '/business/assignment/listTraining',
    method: 'get',
    params: query
  })
}


export function getStateCounts() {
  return request({
    url: '/business/assignment/counts',
    method: 'get'
  })
}

// 查询任务详细
export function getAssignment(id) {
  return request({
    url: '/business/assignment/' + id,
    method: 'get'
  })
}

export function startAssignment(id) {
  return request({
    url: '/business/assignment/start/' + id,
    method: 'get',
  })
}

export function stopAssignment(id) {
  return request({
    url: '/business/assignment/stop/' + id,
    method: 'get',
  })
}

export function startPrioritizeAssignment(id) {
  return request({
    url: '/business/assignment/startPrioritize/' + id,
    method: 'get',
  })
}

// 新增任务
export function addAssignment(data) {
  return request({
    url: '/business/assignment',
    method: 'post',
    data: data
  })
}

// 修改任务
export function updateAssignment(data) {
  return request({
    url: '/business/assignment',
    method: 'put',
    data: data
  })
}

// 删除任务
export function delAssignment(id) {
  return request({
    url: '/business/assignment/' + id,
    method: 'delete'
  })
}

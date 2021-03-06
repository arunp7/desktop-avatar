'use strict'
const bdb = require('baby-db')

const TASKS = {}
let maxid = 0
let ondone_

const taskdb = bdb('tasks.json')
taskdb.on('error', err => console.error(err))
taskdb.on('rec', rec => {
  if(!rec.id) throw `Missing id ${JSON.stringify(rec)}`
  if(rec.id > maxid) maxid = rec.id
  if(TASKS[rec.id]) Object.assign(TASKS[rec.id], rec)
  else {
    if(!rec.action) throw `Missing action: ${JSON.stringify(rec)}`
    if(!rec.userId) throw `Missing userId: ${JSON.stringify(rec)}`
    TASKS[rec.id] = rec
  }
})
taskdb.on('done', () => {
  console.log('Task DB loaded...')
  ondone_ && ondone_()
})

function add(task) {
  task.id = task.id || ++maxid
  taskdb.add(task)
}

function getFor(users) {
  const ret = []
  for(let k in TASKS) {
    const task = TASKS[k]
    if(task.status && task.status !== "new") continue
    if(belongs_1(users, task)) ret.push(task)
  }
  return ret

  function belongs_1(users, task) {
    for(let i = 0;i < users.length;i++) {
      if(users[i] == task.userId) return true
    }
  }
}

function updateStatus(statusUpdates) {
  statusUpdates.map(s => taskdb.add(s))
}

module.exports = {
  add,
  getFor,
  updateStatus,
  ondone: cb => ondone_ = cb,
}

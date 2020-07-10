const prod = 1
export const comonUrl = prod ? "https://api.eos.h3c.com/wxapi/v1.0":"https://api.eos-ts.h3c.com/wxapi/v1.0"
export const baseUrl = prod ? "https://api.eos.h3c.com/microdisk/v1.0":"https://api.eos-ts.h3c.com/microdisk/v1.0"

//登录
export const agentId = prod ? '1000097':'1000011'
export const GET_TOCKEN = comonUrl + '/api/common/gettoken'//获取tocken
export const LOGIN = comonUrl + '/api/jscode2session'//登录验证
export const GET_USERINOF = comonUrl + '/api/common/getuserinfobyuserid'//获取用户信息

//文件夹
export const FOLDER_TREE = baseUrl +'/outside/microdisk/folder/tree'//查询文件树
export const FOLDER_CREATE = baseUrl +'/outside/microdisk/folder/create'//创建文件夹
export const FOLDER_DEL = baseUrl +'/outside/microdisk/folder/delete'//删除文件夹
export const FOLDER_MEMBERUPDATE = baseUrl +'/outside/microdisk/folder/member/update'//修改空间成员
export const FOLDER_RENAME = baseUrl +'/outside/microdisk/folder/update'//文件夹重命名
export const FOLDER_DETAIL = baseUrl +'/outside/microdisk/folder/detail'//查询文件夹详情
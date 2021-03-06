const prod_common = 1 //以防测试环境取不到用户信息，直接用正式环境用户数据
export const comonUrl = prod_common ? "https://api.eos.h3c.com/wxapi/v1.0":"https://api.eos-ts.h3c.com/wxapi/v1.0"
const prod_base = 0
export const baseUrl = prod_base ? "https://api.eos.h3c.com/microdisk/v1.0":"https://api.eos-ts.h3c.com/microdisk/v1.0"
export const baseUrl_Tocken = prod_base ? "https://api.eos.h3c.com/wxapi/v1.0":"https://api.eos-ts.h3c.com/wxapi/v1.0"
//文字图片安全校验
export const  CHECK_MSG = baseUrl + '/outside/common/validate/msgSecCheck' //检查文本
export const  CHECK_IMG = baseUrl + '/outside/common/validate/imgSecCheck' //图片校验
export const  CHECK_MEDIA = baseUrl + '/outside/common/validate/mediaCheckAsync' //图片/音频异步校验

//登录
export const agentId = prod_common ? '1000097':'1000011'
export const GET_TOCKEN = comonUrl + '/api/common/gettoken'//获取tocken
export const LOGIN = comonUrl + '/api/jscode2session'//登录验证
export const GET_USERINOF = comonUrl + '/api/common/getuserinfobyuserid'//获取用户信息

//文件夹
export const GET_TOCKEN_BASE= baseUrl_Tocken + '/api/common/gettoken'//获取tocken
export const FOLDER_TREE = baseUrl +'/outside/microdisk/folder/tree'//查询文件树
export const FOLDER_CREATE = baseUrl +'/outside/microdisk/folder/create'//创建文件夹
export const FOLDER_DEL = baseUrl +'/outside/microdisk/folder/delete'//删除文件夹
export const FOLDER_MEMBERUPDATE = baseUrl +'/outside/microdisk/folder/member/update'//修改空间成员
export const FOLDER_RENAME = baseUrl +'/outside/microdisk/folder/update'//文件夹重命名
export const FILE_RENAME = baseUrl +'/outside/microdisk/file/update'//文件重命名
export const FOLDER_DETAIL = baseUrl +'/outside/microdisk/folder/detail'//查询文件夹详情
export const SPACE_EXIT = baseUrl +'/outside/microdisk/folder/member/exit'//退出空间
export const SCREEN_LOG = baseUrl +'/outside/microdisk/screen/log'//截屏日志
export const FILE_UPLOAD = baseUrl +'/outside/microdisk/file/upload'//文件上传
export const FILE_DEL = baseUrl +'/outside/microdisk/file/delete'//删除文件
export const SYS_ADMIN= baseUrl + '/outside/microdisk/sys/admin' //查询超级管理员
export const SYS_ADMIN_UPDATE= baseUrl + '/outside/microdisk/sys/update' //修改超级管理员
export const FOLDER_PRIVATE= baseUrl + '/outside/microdisk/folder/privateFolder' //查询私人空间(可对接)
export const FILE_SHARE= baseUrl + '/outside/microdisk/file/share' //文件分享
export const FILE_MOVE = baseUrl + '/outside/microdisk/folder/move' //文件移动
export const FILE_SENDUPLOADMSG = baseUrl + '/outside/microdisk/file/sendUploadMsg' //文件上传推送消息
export const FILE_PREVIEW_PERMISSION = baseUrl + '/outside/microdisk/file/preview' //文件预览赋权
const prod = 0
export const baseUrl = prod ? "https://api.eos.h3c.com/wxapi/v1.0":"http://api.eos-ts.h3c.com/wxapi/v1.0"

//获取tocken
export const GET_TOCKEN = baseUrl + '/api/common/gettoken'
//登录验证
export const LOGIN = baseUrl + '/api/jscode2session'

// http://api.eos-ts.h3c.com/wxapi/v1.0/api/common/gettoken
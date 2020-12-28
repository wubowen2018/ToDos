const express = require('express')
const bodyParser = require('body-parser')
const app = express()

//引入ORM模型文件
const models = require('../db/models')
const { ne } = require('sequelize/types/lib/operators')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//利用中间件实现跨域
app.use('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //这个表示任意域名都可以访问，这样写不能携带cookie了。
    //res.header('Access-Control-Allow-Origin', 'http://www.baidu.com'); //这样写，只有www.baidu.com 可以访问。
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');//设置方法
    if (req.method == 'OPTIONS') {
        res.send(200); // 意思是，在正常的请求之前，会发送一个验证，是否可以请求。
    }
    else {
        next();
    }
});

/**
 * 利用中间实现一个简单的logger
 */
app.use((req, res, next)=>{
    console.log('请求方法------[%s]',req.method)
    console.log('请求路径------[%s]',req.url)
    console.log('请求参数------[%s]',JSON.stringify(req.body))
    next()
})

/**
 * 创建一个todo
 */
app.post('/create',async (req, res, next)=>{
    try {
        let { name, deadline, content} = req.body
        /**数据持久化到数据库 */
        let todo = await models.Todo.create({
            name,
            deadline,
            content
        })
        res.json({
            todo,
            message: "任务创建成功"
        }) 
    } catch (error) {
        next(error)
    }
    
})

/**
 * 修改一个todo
 */
app.post('/update',async (req, res, next)=>{
    try {
        let { name, deadline, content, id} = req.body
        let todo = await models.Todo.findOne({
            where:{
                id
            }
        })
        if (todo) {
            //如果找到 todo 去做更新操作
            todo = await todo.update({
                name,
                deadline,
                content
            })
        }
        res.json({
            todo
        })   
    } catch (error) {
        next(error)
    }
})

/**
 * 修改一个todo的状态
 * 完成/代办
 */
app.post('/update_status',async (req, res, next)=>{
    try {
        let { id, status } = req.body
        let todo = await models.Todo.findOne({
            where:{
                id
            }
        })
        if (todo && status != todo.status ) {
            //执行更新
            todo = await todo.update({
                status
            })
        }
        res.json({
            todo
        }) 
    } catch (error) {
        next(error)
    }
})

/**
 * 查询任务列表 
 * 可以分页
 */
app.get('/list/:status/:page', async (req, res, next)=>{
    // 1. 状态 1 代办 2 完成 3 删除 0全部
    // 2. 分页处理
    let { status, page } = req.params 
    let limit = 10
    let offset = (page - 1) * limit 
    let where = {}
    if ( status !== 0 ) {
        where.status = status
    }
    let list = await models.Todo.findAndCountAll({
        where,
        limit,
        offset
    })
    res.json({
        list,
        message: '查询成功'
    })
})

/**
 * 异常处理
 * 所有的错误 http code 500
 */
app.use((err, req, res, next)=>{
    if (err) {
        res.status(500).json({
            message:err.message
        })
    }
})

app.listen(3000, ()=>{
    console.log('服务启动成功');
})

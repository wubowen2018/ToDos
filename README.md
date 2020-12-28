## 数据库初始化
1. 创建数据库
2. 使用 sequelize cli 初始化项目数据库配置
` npx sequelize init `
3. 生成模型文件
    1. migrate 文件
    2. model 文件
    ` npx sequelize model:generate --name Todo --attributes name:string,deadline:date,content:string `
4. 持久化模型对应的数据库表
    ` npx sequelize db:migrate `

## API里面具体使用ORM模型



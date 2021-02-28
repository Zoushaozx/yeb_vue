<template>
    <div style="width:500px">
        <el-input
            placeholder="请输入部门名称进行搜索..."
            v-model="filterText"
            prefix-icon="el-icon-search">
        </el-input>
        <el-tree
        class="filter-tree"
        :data="deps"
        :props="defaultProps"
        :filter-node-method="filterNode"
        :expand-on-click-node="false"
        ref="tree">
            <span class="custom-tree-node" 
            slot-scope="{ node, data }" 
            style="display:flex; justify-content: space-between; width:100%">
                <span>{{ data.name }}</span>
                <span>
                <el-button
                        type="primary"
                        size="mini"
                        class="depBtn"
                        @click="() => showAddDep(data)">
                        添加部门
                    </el-button>
                    <el-button
                        type="danger"
                        size="mini"
                        class="depBtn"
                        @click="() => deleteDep(data)">
                        删除部门
                    </el-button>
                </span>
            </span>
        </el-tree>

        <el-dialog
        title="添加部门"
        :visible.sync="dialogVisible">
        <div>
            <table>
                <tr>
                    <td>
                        <el-tag>上级部门</el-tag>
                    </td>
                    <td>{{pname}}</td>
                </tr>
                <tr>
                    <td>
                        <el-tag>部门名称</el-tag>
                    </td>
                    <td>
                        <el-input v-model="dep.name" placeholder="请输入部门名称..."></el-input>
                    </td>
                </tr>
            </table>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="doAddDep">确 定</el-button>
        </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        name: "DepMenu",
        data(){
            return {
                filterText:'',
                deps:[],
                pname:'',
                dialogVisible: false,
                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                dep:{
                    name:'',
                    parentId:-1
                }
            }
        },
        watch: {
            //监视 filterText 
            filterText(val) {
                this.$refs.tree.filter(val);
            }
        },
        mounted(){
            this.initDeps();
        },
        methods:{
            //初始化部门数据
            initDeps(){
                this.getRequest('/system/basic/department/').then(resp=>{
                    if(resp){
                        this.deps = resp;
                    }
                })
            },
            //搜索展示
            filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
            },
            // 展示添加部门对话框
            showAddDep(data){
                this.dialogVisible = true;
                this.pname = data.name;
                this.dep.parentId = data.id;
            },
            // 将部门数据插入数据库
            doAddDep(){
                this.postRequest("/system/basic/department/",this.dep).then(resp=>{
                    if(resp){
                    this.initDep();
                    this.dialogVisible=false;
                    this.insertDepWithDeps(resp.obj,this.deps);
                    }
                })
            },
            // 重置部门结构体
            initDep(){
                this.dep ={
                    name :'',
                    parentId:-1
                };
                this.pname = '';
            },
            // 手动插入添加的部门信息到部门展示信息列表
            insertDepWithDeps(dep,deps){
                for(let i= 0;i<deps.length;i++){
                    let d = deps[i];
                    if( d.id==dep.parentId){
                        // 加入数据 concat
                         d.children =  d.children.concat(dep);
                        if( d.children.length>0){
                             d.isParent = true;
                        }
                        return;
                    }else{
                        this.insertDepWithDeps(dep,d.children);
                    }
                }
            },
            //手动移除信息部门展示信息列表里的被删除部门信息
            removeDepFromDeps(id,deps,p){
                for(let i= 0;i<deps.length;i++){
                    let d  = deps[i];
                    if(d.id==id){
                        // 移除数据 splice
                        deps.splice(i,1);
                        if(deps.length==0){
                            p.isParent = false;
                        }
                        return;
                    }else{
                        this.removeDepFromDeps(id,d.children,d);
                    }
                }
            },
            // 删除部门数据
            deleteDep(data){
                 if(data.isParent){
                     this.$message.error("父部门不允许删除");
                 } else {
                    this.$confirm('此操作将永久删除该【'+data.name+'】部门， 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        this.deleteRequest("/system/basic/department/"+data.id).then(resp=>{
                            if(resp){
                                this.removeDepFromDeps(data.id,this.deps,null);
                            }
                        })
                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消删除'
                        });          
                    });
                 }
            }
            
        }
    }
</script>

<style>
.depBtn {
    padding: 2px;
}
</style>
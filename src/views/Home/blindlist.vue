<template>
    <div >
            <el-row>
                <el-button type="primary" @click="handleClickAddBlind">添加</el-button>
                <el-button type="primary" @click="handleClickDelete">删除</el-button>
                <el-button type="primary">发布</el-button>
            </el-row>
        <el-row>

            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @selection-change="handleSelectionChange">
                <el-table-column
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column
                        fixed
                        prop="id"
                        label="ID"
                        width="150">
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="名称"
                        width="300">
                </el-table-column>
                <el-table-column
                        prop="level"
                        label="盲注级别"
                        width="300">
                </el-table-column>
                <el-table-column
                        prop="maxSB"
                        label="最大盲注"
                        width="300">
                </el-table-column>
                <el-table-column
                        prop="maxAnte"
                        label="最大前注"
                        width="300">
                </el-table-column>

                <el-table-column
                        fixed="right"
                        label="操作"
                        width="100">
                    <template slot-scope="scope">
                        <el-button @click="handleClickView(scope.row)" type="text" size="small">查看</el-button>
                        <el-button @click="handleClickModify(scope.row)" type="text" size="small">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row>
            <div class="block">
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="currentPage"
                        :page-sizes="pageSizeList"
                        :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="totalSize">
                </el-pagination>
            </div>
        </el-row>
         <!-- begin 编辑盲注信息 -->
        <el-dialog
                :title="editDialog.title"
                :visible.sync="editDialog.show"
                :close-on-click-modal='false'
                :close-on-press-escape='false'
                :modal-append-to-body="false">
                <el-form size="mini">
                    <el-form-item label="盲注ID" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="5">
                                <el-input v-model="editForm.id" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="盲注名称" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="5">
                        <el-input v-model="editForm.name" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="其它信息配置" :label-width="editDialog.formLabelWidth">
                        <el-row></el-row>
                        <el-row :gutter="20">
                            <el-col :span="3">盲注级别</el-col>
                            <el-col :span="3">小盲</el-col>
                            <el-col :span="3">前注</el-col>
                            <el-col :span="4">涨盲时间</el-col>
                            <el-col :span="4">最小筹码</el-col>
                            <el-col :span="3">休息时间</el-col>
                        </el-row>
                        <el-row>
                            <template v-for="(item,index) in editForm.levelInfo" >
                                <el-row>
                                    <el-col :span="3">{{index+1}}</el-col>
                                    <el-col :span="3"><el-input v-model="editForm.levelInfo[index].SB" :disabled="editDialog.disableEditState">{</el-input></el-col>
                                    <el-col :span="3"><el-input v-model="editForm.levelInfo[index].ante" :disabled="editDialog.disableEditState">{</el-input></el-col>
                                    <el-col :span="4"><el-input v-model="editForm.levelInfo[index].upSec" :disabled="editDialog.disableEditState">{</el-input></el-col>
                                    <el-col :span="4"><el-input v-model="editForm.levelInfo[index].leastChip" :disabled="editDialog.disableEditState">{</el-input></el-col>
                                    <el-col :span="3"><el-input v-model="editForm.levelInfo[index].restSec" :disabled="editDialog.disableEditState">{</el-input></el-col>
                                </el-row>
                            </template>
                        </el-row>
                        <el-row>
                            <template v-if="editDialog.disableEditState === false">
                                <el-button @click="handleAddLevel">增加</el-button>
                            </template>
                        </el-row>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <template v-if="editDialog.disableEditState === false">
                        <el-button @click="handleEditDialogCancel">取 消</el-button>
                    </template>
                    <el-button type="primary" @click="handleEditDialogConfirm">确 定</el-button>
                </div>
        </el-dialog>
        <!-- end 编辑盲注信息-->

    </div>

</template>

<script>
    import {axios} from '~/utils';
    const ACTION_NO_BLIND_INFO = 0;
    const ACTION_ADD_BLIND_INFO = 1;
    const ACTION_VIEW_BLIND_INFO = 2;
    const ACTION_EDIT_BLIND_INFO = 3;
    export default {
        name: 'blindlist',
        data() {
            return {

                tableData: [], //展示的表数据
                selectedBid:[],
                //分页栏
                currentPage: 1, //当前页码
                pageSizeList : [10,20,30],
                pageSize : 10,
                totalSize: 0,
                //盲注信息对话框form数据
                editDialog:{
                    width:'400px',
                    show : false,
                    title: '涨盲规则',
                    formLabelWidth:'120px',
                    disableEditState: false,
                    action: ACTION_ADD_BLIND_INFO, //1.添加盲注信息; 2.查看盲注信息; 3.编辑盲注信息
                    currentRowId:0
                },
                //盲注信息list
                editForm: {
                    name: '',
                    id :0,
                    levelInfo: [],
                },
            }
        },
        mounted(){
            //元素挂载渲染时，默认展示第一页和前10条
            this.getList(1, 10);
        },
        methods:{
            /*
                分页相关函数
            */
            handleSizeChange(val) {
                //console.log(`每页 ${val} 条`);
                this.pageSize = val
                this.currentPage = 1
                this.getList(this.currentPage,this.pageSize)
            },
            handleCurrentChange(val) {
                //console.log(`当前页: ${val}`);
                this.currentPage = val
                this.getList(this.currentPage,this.pageSize)
            },
            //点击删除按钮
            handleClickDelete(){
                if(this.selectedBid.length > 0){
                axios({
                     type:'delete',
                     path:'/api/blinds',
                     data:this.selectedBid,
                     fn:data=>{
                         this.selectedBid = []
                         this.getList(this.currentPage,this.pageSize)
                     }
                 })
                }


            },
            //点击盲注规则表单查看按钮
             handleClickView(row) {
                //console.log(row);
                 this.editDialog.disableEditState = true
                 this.editDialog.action = ACTION_VIEW_BLIND_INFO
                 this.editForm.levelInfo = []
                 this.editForm.name = ""
                 this.editForm.id = 0

                 axios({
                     type:'get',
                     path:'/api/blinds/'+row.id.toString(),
                     fn:data=>{
                         let jsonData = JSON.parse(data)
                         this.totalSize = jsonData.total
                         this.editForm.id = jsonData.id
                         this.editForm.name = jsonData.name
                         this.editForm.levelInfo = jsonData.detail
                     }
                 })
                 this.editDialog.show = true
            },
            //选择
            handleSelectionChange(val) {
                //console.log(val)
                this.selectedBid = []
                for (let i= 0 ; i < val.length; i++){
                    let item = {
                        "bid": val[i].id
                    }
                    this.selectedBid.push(item)
                }

            },
            //点击编辑修改按钮
            handleClickModify(row){
                this.editDialog.disableEditState = false
                this.editDialog.action = ACTION_EDIT_BLIND_INFO
                this.editForm.levelInfo = []
                this.editForm.name = ""
                this.editForm.id = row.id
                this.editDialog.currentRowId = row.id

                axios({
                     type:'get',
                     path:'/api/blinds/'+row.id.toString(),
                     fn:data=>{
                         let jsonData = JSON.parse(data)
                         this.totalSize = jsonData.total
                         this.editForm.id = jsonData.id
                         this.editForm.name = jsonData.name
                         this.editForm.levelInfo = jsonData.detail
                     }
                 })
                 this.editDialog.show = true
            },
            //点击添加按钮
            handleClickAddBlind(){
                this.editDialog.disableEditState = false
                this.editDialog.action = ACTION_ADD_BLIND_INFO
                //double check 重置数据
                this.editForm.id = 0
                this.editForm.levelInfo = []
                this.editForm.name = ""
                this.editDialog.show = true
            },

            /*
              添加盲注系列函数
            */

            //添加盲注级别
            handleAddLevel(){
                let len = this.editForm.levelInfo.length
                this.editForm.levelInfo.push({
                    "level": len+1,
                    "SB":"",
                    "ante":"",
                    "upSec":"",
                    "leastChip":"",
                    "restSec":""
                })
            },

            //编辑盲注信息对话框取消按钮
            handleEditDialogCancel(){
                this.editDialog.show = false
                this.editForm.levelInfo=[]
                this.editDialog.action = ACTION_NO_BLIND_INFO

            },

            //编辑盲注信息对话框确认按钮
            handleEditDialogConfirm(){
                let data = {}
                let path = ""
                let type = ""

                switch(this.editDialog.action){
                    case ACTION_ADD_BLIND_INFO:
                        path = "/api/blinds"
                        type = "post"
                        break
                    case ACTION_EDIT_BLIND_INFO:
                        path = "/api/blinds/"+this.editDialog.currentRowId.toString()
                        type = "put"
                        break
                    case  ACTION_VIEW_BLIND_INFO:
                        break;
                }

                if(this.editDialog.action === ACTION_ADD_BLIND_INFO ||
                    this.editDialog.action === ACTION_EDIT_BLIND_INFO){
                    //校验数据
                    data.name = this.editForm.name
                    data.id = parseInt(this.editForm.id)
                    data.detail = []
                    let blindlist = this.editForm.levelInfo
                    try{
                        for(let i = 0; i < blindlist.length; i++){
                            let item = {}
                            item.level =blindlist[i].level
                            item.SB = parseInt(blindlist[i].SB,10)
                            item.ante = parseInt(blindlist[i].ante,10)
                            item.upSec = parseInt(blindlist[i].upSec,10)
                            item.leastChip = parseInt(blindlist[i].leastChip,10)
                            item.restSec = parseInt(blindlist[i].restSec,10)
                            data.detail.push(item)
                        }
                        //调用API
                        axios({
                                type:type,
                                path:path,
                                data:data,
                                fn:data=>{
                                    //提交后重新获得分页数据
                                    this.getList(this.currentPage,this.pageSize)
                                },
                                errFn:data=>{
                                    console.log(data)
                                    console.log("error")
                                },
                            }
                        )
                    }catch (e) {
                        return
                    }
                }
                //提交完成清空数据
                this.editDialog.show = false
                this.editForm.levelInfo = []
                this.editDialog.action = ACTION_NO_BLIND_INFO
            },
            //获得盲注规则列表
            getList(
                page,
                page_size
            ){
                let data = {
                    "page": page,
                    "per_page":page_size,
                }
                axios({
                    type:'get',
                    path:'/api/blinds',
                    data: data,
                    fn:data=>{
                        this.tableData = []
                        let jsonData = JSON.parse(data)
                        this.totalSize = jsonData.total
                        jsonData.ruleList.forEach((item,index)=>{
                            this.tableData.push(item)
                        })
                    }
                })
               }
        }
    }
</script>

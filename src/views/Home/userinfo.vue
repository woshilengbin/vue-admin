<template>
    <div>
        <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                <template slot="prepend">游戏ID</template>
                <el-button slot="append" icon="el-icon-search" @click="query" ></el-button>
            </el-input>
        </div>
        <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                <template slot="prepend">平台ID</template>
                <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
            </el-input>
        </div>
        <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                <template slot="prepend">Name</template>
                <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
            </el-input>
        </div>
        <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                <template slot="prepend">Email</template>
                <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
            </el-input>
        </div>
        <div style="margin-top: 15px;">
            <el-input placeholder="请输入内容" v-model="input5" class="input-with-select">
                <template slot="prepend">电话</template>
                <el-button slot="append" icon="el-icon-search" @click="query"></el-button>
            </el-input>
        </div>
    </div>
</template>

<script>
    import {axios} from '~/utils';
    export default {
        name: "userinfo",

        data() {
            return {
                gameid:"",
                platformid:"",
                name:"",
                email:"",
                phone:"",
                equipmentid:""
            }
        },
        methods:{
            query(){
                console.log("lts:111")
                let data = {
                    "gameid":this.gameid,
                    "platformid":this.platformid,
                    "name":this.name,
                    "email":this.email,
                    "phone":this.phone,
                    "equipmentid":this.equipmentid
                }
                console.log("lts:111")
                axios({
                    type:'get',
                    path:'/api/userinfo',
                    data: data,
                    fn:data=>{
                        console.log("lts:111")
                        this.tableData = []
                        let jsonData = JSON.parse(data)
                        jsonData.forEach((item,index)=>{
                            this.tableData.push(item)
                        })
                    }
                })

            }
        }

    }
</script>

<style scoped>

</style>
<template>
    <p>{{message}}</p>
</template>


<script>
    import {axios} from '~/utils'
    import * as mUtils from '~/utils/mUtils'
    import {mapActions, mapState, mapGetters} from 'vuex'

    export default {
        name: 'blank',
        data() {
            return {
                message: 'loading',
            }
        },
        methods: {
            ...mapActions(['addMenu', 'changeSideBarMenu']),
            getMenu() {
                axios({
                    type: 'get',
                    path: '/api/menus',
                    fn: data => {
                        console.log(data);
                        this.generateMenuPushIndex(data) //模拟动态生成菜单并定位到index
                    }
                })
            },
            generateMenuPushIndex(data) {
                mUtils.setStore("menuData", data)
                let obj = JSON.parse(data)
                let routes = mUtils.generateMenu(obj, 0)
                const asyncRouterMap = [
                    {
                        path: '/404',
                        name: '404',
                        hidden: true,
                        component: require('~/views/Home/404.vue').default
                    },
                    {
                        path: '/index',
                        name: '',
                        hidden: true,
                        component: require('~/views/Home/Index.vue').default,
                        children: routes
                    }
                ]
                // console.log(routes);
                this.$router.addRoutes(asyncRouterMap)
                this.addMenu(routes)
                this.$router.push("/index")
            },
        },
        mounted() {
            this.getMenu();
        },
    }
</script>

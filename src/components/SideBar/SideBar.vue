<template>
    <div>
        <div class="menu">
            <el-menu router background-color="#222d32" text-color="#fff" :default-active="$route.path" class="menu" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
                <template v-for="(menu_v,menu_k) in menu">
                    <el-submenu v-if="menu_v.children" :index="menu_k">
                        <template slot="title">
                            <i :class="menu_v.icon"></i>
                            <span slot="title">{{ menu_v.name }}</span>
                        </template>
                        <el-menu-item v-for="(menuChildren_v,menuChildren_k) in menu_v.children"
                                      :key="menuChildren_k"
                                      :index="menuChildren_v.path">
                            <i class="is-children fa fa-circle-o"></i>
                            <span slot="title">{{ menuChildren_v.name }}</span>
                        </el-menu-item>
                    </el-submenu>
                    <el-menu-item v-else :index="menu_v.path">
                        <i :class="menu_v.icon"></i>
                        <span slot="title">{{ menu_v.name }}</span>
                    </el-menu-item>
                </template>
            </el-menu>

        </div>
        <div class="sidebar-toggle" @click="sidebarToggle">
            <div class="icon-left">
                <i class="el-icon-back"></i>
            </div>
        </div>
    </div>

</template>
<script>
    import Menu from '~/menu/index';

    export default {
        data() {
            return {
                isCollapse: false,
                menu: Menu,
            };
        },
        methods: {
            NavBarWidth() {
                let navBar = document.getElementById('nav-bar');
                if (!navBar) return;
                if (!(this.fixedTabBar && this.switchTabBar)) {
                    navBar.style.width = '100%';
                    return;
                }
                let sidebarClose = document.body.classList.contains('sidebar-close')
                if (sidebarClose) {
                    navBar.style.width = '100%';
                    return;
                }
                if (this.isCollapse) navBar.style.width = 'calc(100% - 64px)';
                else navBar.style.width = 'calc(100% - 230px)';

            },
            handleOpen(key, keyPath) {
                //console.log(key, keyPath);
            },
            handleClose(key, keyPath) {
                //关闭菜单
            },
            sidebarToggle(e) {
                e.preventDefault();
                if (this.isCollapse) {
                    document.body.classList.remove('sidebar-hidden')
                    this.siteName = this.$Config.siteName
                    this.isCollapse = false;
                } else {
                    document.body.classList.add('sidebar-hidden')
                    this.isCollapse = true;
                }
                this.NavBarWidth();

            },
        }
    }
</script>
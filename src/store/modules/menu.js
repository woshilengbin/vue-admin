const types ={
    ADD_MENU : 'ADD_MENU', //添加菜单
    CHANGE_SIDEBAR : 'CHANGE_SIDEBAR'
}



const state= {
    menuItems : [],
    sideBarMenuItems: []
};


const mutations= {
    //添加菜单项
    [types.ADD_MENU](state,menuItems){
        if(menuItems.length === 0){
            state.menuItems = [];
            state.sideBarMenuItems = []
        }else{
            state.menuItems = menuItems
            if (menuItems[0].children){
                state.sideBarMenuItems = menuItems[0].children
            }
        }
    },
    //修改侧边栏菜单
    [types.CHANGE_SIDEBAR](state, index){
        if (index < state.menuItems.length){
            if (state.menuItems[index].children){
                state.sideBarMenuItems = state.menuItems[index].children
            }
        }
    }

}


const actions ={
    addMenu:({commit}, menuItems)=>{
        if(menuItems.length > 0){
            commit(types.ADD_MENU,menuItems)
        }
    },
    changeSideBarMenu:({commit},index)=>{
        commit(types.CHANGE_SIDEBAR, index)
    }

}


export default {
    //namespaced: true,
    state,
    actions,
    mutations
}

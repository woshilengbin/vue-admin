<template>
    <div >
        <el-row>
            <el-button type="primary" @click="handleClickOrderBy">{{orderButtonLabel}}</el-button>
            <el-button type="primary" @click="handleClickAddTo">添加</el-button>
            <el-button type="primary">发布到内网</el-button>
            <el-button type="primary">发布到正式</el-button>
            <el-checkbox v-model="showDelChecked" label="显示删除" border></el-checkbox>
            <el-dropdown @command="handleCommand">
                <el-button type="primary">
                    更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="copy">复制</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                    <el-dropdown-item command="revert">删除还原</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </el-row>
        <el-row>

            <el-table
                    ref="multipleTable"
                    :data="tableData"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    :default-sort = "{prop: 'id', order: 'descending'}">
                <template v-if="orderState">
                    <el-table-column
                        fixed
                        prop="sortId"
                        label="排序ID"
                        width="150">
                        <el-input-number></el-input-number>
                    </el-table-column>
                </template>

                <el-table-column
                        type="selection"
                        width="55">
                </el-table-column>
                <el-table-column
                        fixed
                        label="ID"
                        width="150">
                    <template slot-scope="scope">
                        <el-button @click="handleClickView(scope.row)" type="text" size="small">{{scope.row.id}}</el-button>
                        <!-- <el-button @click="handleClickModify(scope.row)" type="text" size="small">停止调度</el-button> -->
                    </template>
                </el-table-column>
                <el-table-column
                        prop="name"
                        label="名称"
                        width="300">
                </el-table-column>
                <el-table-column
                        prop="type"
                        label="类型"
                        width="150">
                </el-table-column>
                <el-table-column
                        prop="matchPeriod"
                        label="开赛时间段"
                        width="300"
                        :formatter="formatter">
                </el-table-column>
                <el-table-column
                        prop="operateRec"
                        label="操作记录"
                        width="300">
                </el-table-column>
                <el-table-column
                        fixed="right"
                        label="操作"
                        width="100">
                    <template slot-scope="scope">
                        <el-button @click="handleClickView(scope.row)" type="text" size="small">开始调度</el-button>
                        <el-button @click="handleClickModify(scope.row)" type="text" size="small">停止调度</el-button>
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

        <!-- begin 编辑赛事配置信息信息 -->
        <el-dialog
                :title="editDialog.title"
                :visible.sync="editDialog.show"
                :close-on-click-modal='false'
                :close-on-press-escape='false'
                :modal-append-to-body="false">
            <el-row>基本信息配置</el-row>
            <el-form  size="mini" :model="rawForm" :rules="rules" ref="rawForm">
                <el-form-item label="比赛名称" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="15">
                            <el-input v-model="rawForm.name" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="5">
                            <el-select v-model="rawForm.matchType" clearable placeholder="请选择比赛类型">
                                <el-option
                                        v-for="item in matchTypeOptions"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="排序ID" prop="sortId" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="5">
                            <el-input v-model.number="rawForm.sortId" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="有效时间" :label-width="editDialog.formLabelWidth">
                    <el-date-picker
                            v-model="rawForm.startTime"
                            type="datetime"
                            placeholder="选择日期时间">
                    </el-date-picker>
                    至
                    <el-date-picker
                            v-model="rawForm.endTime"
                            type="datetime"
                            placeholder="选择日期时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="循环时间" :label-width="editDialog.formLabelWidth">
                    <el-checkbox :indeterminate="isIndeterminate" v-model="weekDaycheckAll" @change="handleCheckAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="rawForm.weekDays" @change="handleCheckedCitiesChange">
                        <el-checkbox v-for="(day,index) in weekDaysOptions" :label="index" :key="day">{{day}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="开赛时间间隔" prop="intervalSec":label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="5">
                            <el-input v-model.number="rawForm.intervalSec" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="5">秒</el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="指定开始时间" :label-width="editDialog.formLabelWidth">
                    <el-date-picker
                            v-model="rawForm.startDate"
                            type="datetime"
                            placeholder="选择日期时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="参赛人数" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3">最低人数</el-col>
                        <el-col :span="3">
                            <el-form-item prop="minPlayerNum">
                                <el-input v-model.number="rawForm.minPlayerNum" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="3">上限人数</el-col>
                        <el-col :span="3">
                            <el-form-item prop="maxPlayerNum">
                                <el-input v-model.number="rawForm.maxPlayerNum" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="每张桌子的座位数" prop="seatCnt" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3">
                            <el-input v-model.number="rawForm.seatCnt" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="赛事列表" prop="listNum" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3">展示最近的</el-col>
                        <el-col :span="3">
                            <el-input v-model.number="rawForm.listNum" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="3">场，图片</el-col>
                        <el-col :span="3"><el-button size="small" type="primary">选择</el-button></el-col>
                        <el-col :span="3">
                            <el-upload
                                    class="upload-demo"
                                    action="https://jsonplaceholder.typicode.com/posts/"
                                    :on-preview="handlePreview"
                                    :on-remove="handleRemove"
                                    :before-remove="beforeRemove"
                                    multiple
                                    :limit="3"
                                    :on-exceed="handleExceed"
                                    :file-list="fileList">
                                <el-button size="small" type="primary">上传</el-button>
                            </el-upload>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="延迟开赛时间" prop="startDelaySec" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.startDelaySec" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        <el-col :span="6">秒（0不支持延迟开赛）</el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="初始筹码" prop="initChips" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.initChips" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="盲注ID" prop="blindId" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.blindId" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="玩家行动时间" prop="bettingSec" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.bettingSec" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        <el-col :span="3">秒</el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="FT赛前倒计时" prop="suspendSec" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.suspendSec" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        <el-col :span="9">秒（配合客户端的动画播放调整）</el-col>
                    </el-row>
                </el-form-item>
                <el-row>报名配置</el-row>
                <el-form-item label="选择报名方式" :label-width="editDialog.formLabelWidth">
                    <el-select v-model="rawForm.signUpType" clearable placeholder="请选择">
                        <el-option
                                v-for="item in signUpTypeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <template v-if="rawForm.signUpType === 0 || rawForm.signUpType === 2">
                    <el-form-item label="参赛费" prop="fee" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="3"><el-input v-model.number="rawForm.fee" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="服务费" prop="tip" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="3"><el-input v-model.number="rawForm.tip" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        </el-row>
                    </el-form-item>
                </template>
                <template v-if="rawForm.signUpType === 1 || rawForm.signUpType === 2">
                    <el-form-item label="道具报名" prop="signUpPropNum" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="3"><el-input v-model.number="rawForm.signUpPropNum" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                            <el-col :span="3">个（张）</el-col>
                            <el-col :span="6"><el-select v-model.number="rawForm.signUpPropId" clearable placeholder="请选择道具">
                                <el-option
                                        v-for="item in signUpPropsList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select></el-col>
                        </el-row>
                    </el-form-item>
                </template>

                <el-form-item label="延迟报名开关" :label-width="editDialog.formLabelWidth">
                    <el-radio-group v-model="rawForm.delaySignUpFlag">
                        <el-radio :label="0">关闭</el-radio>
                        <el-radio :label="1">开启</el-radio>
                    </el-radio-group>
                </el-form-item>
                <template v-if="rawForm.delaySignUpFlag === 1">
                    <el-form-item label="延迟报名级别" prop="delaySignUpLvl" :label-width="editDialog.formLabelWidth">
                        <el-row :gutter="20">
                            <el-col :span="3"><el-input v-model.number="rawForm.delaySignUpLvl" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                        </el-row>
                    </el-form-item>
                </template>
                <el-form-item label="确认报名开关" :label-width="editDialog.formLabelWidth">
                    <el-radio-group v-model="rawForm.signUpConfirmFlag">
                        <el-radio :label="0">关闭</el-radio>
                        <el-radio :label="1">开启</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-row>奖励配置</el-row>
                <el-form-item label="金币奖励类型" :label-width="editDialog.formLabelWidth">
                    <el-select v-model="rawForm.bonusType" clearable placeholder="请选择">
                        <el-option
                                v-for="item in bonusTypeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="金币奖励ID" prop="bonusId" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.bonusId" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="礼包奖励ID" prop="rewardId" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.rewardId" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="保底奖池" prop="minBonus" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.minBonus" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="额外奖池" prop="extraBonus" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.extraBonus" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="积分开关" :label-width="editDialog.formLabelWidth">
                    <el-radio-group v-model="rawForm.pointFlag">
                        <el-radio :label="0">关闭</el-radio>
                        <el-radio :label="1">开启</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="排名图片" :label-width="editDialog.formLabelWidth">
                </el-form-item>
                <el-form-item label="猎人金ID" prop="bountyId" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20">
                        <el-col :span="3"><el-input v-model.number="rawForm.bountyId" :disabled="editDialog.disableEditState" auto-complete="off"></el-input></el-col>
                    </el-row>
                </el-form-item>
                <el-row>特殊规则</el-row>
                <el-form-item label="rebuy 配置" :label-width="editDialog.formLabelWidth">
                    <el-row :gutter="20"></el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">可rebuy的次数:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyCnt">
                                <el-input v-model.number="rawForm.rebuyCnt" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">可rebuy的盲注级别:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyLvl">
                                <el-input v-model.number="rawForm.rebuyLvl" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">rebuy条件筹码:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyCondChip">
                                <el-input v-model.number="rawForm.rebuyCondChip" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">可rebuy的筹码:</el-col>
                        <el-col :span="5">
                                <el-form-item prop="rebuyChip">
                                    <el-input v-model.number="rawForm.rebuyChip" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                                </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">rebuy费用:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyFee">
                                <el-input v-model.number="rawForm.rebuyFee" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">rebuy服务费:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyTip">
                                <el-input v-model.number="rawForm.rebuyTip" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">rebuy超时时间:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="rebuyTimeout">
                                <el-input v-model.number="rawForm.rebuyTimeout" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="addon 配置" :label-width="editDialog.formLabelWidth">
                    <el-row ></el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">可addon的次数:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="addonCnt">
                                <el-input v-model.number="rawForm.addonCnt" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">可addon的盲注级别:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="addonLvl">
                                <el-input v-model.number="rawForm.addonLvl" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">addon费用:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="addonFee">
                                <el-input v-model.number="rawForm.addonFee" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">addon服务费:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="addonTip">
                                <el-input v-model.number="rawForm.addonTip" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">addon筹码倍数:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="addonMutil">
                                <el-input v-model.number="rawForm.addonMutil" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="reentry 配置" :label-width="editDialog.formLabelWidth">
                    <el-row></el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">可reentry盲注等级:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="reentryLvl">
                                <el-input v-model.number="rawForm.reentryLvl" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="5">可reentry次数:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="reentryCnt">
                                <el-input v-model.number="rawForm.reentryCnt" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="时间银行配置"  :label-width="editDialog.formLabelWidth">
                    <el-row></el-row>
                    <el-row :gutter="20">
                        <el-col :span="5">时间银行可使用次数:</el-col>
                        <el-col :span="5">
                            <el-form-item prop="bankBetCnt">
                                <el-input v-model.number="rawForm.bankBetCnt" @change="checkNumber" :disabled="editDialog.disableEditState" auto-complete="off"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item> -->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <template v-if="editDialog.disableEditState === false">
                    <el-button @click="handleEditDialogClickCancel">取 消</el-button>
                </template>
                <el-button type="primary" @click="handleEditDialogClickConfirm">确 定</el-button>
            </div>
        </el-dialog>
        <!-- end 编辑赛事信息-->


    </div>

</template>

<script>
    import {axios,} from '~/utils';

    /*
    比赛类型定义
     */
    const MATCH_TYPE_NONE = 0;
    const MATCH_TYPE_MTT_REGULAR = 1;
    const MATCH_TYPE_MTT_HUNTER = 2;
    const MATCH_TYPE_MTT_LADY = 3;
    const MATCH_TYPE_MTT_FLIPOUT = 4;
    const MATCH_TYPE_SNG_REGULAR = 5;
    const MATCH_TYPE_SNG_SPINGO = 6;
    const MATCH_TYPE_REGULAR = 7;
    const MATCH_TYPE_SELF_REGULAR = 8;
    const MATCH_TYPE_SELF_SNG= 9;
    const MATCH_TYPE_SELF_MTT = 10;
    const MATCH_TYPE_TEAM = 11;
    const MATCH_TYPE_MTT_LUCKY = 12;
    const MATCH_TYPE_OFFLINE= 13;
    const MATCH_TYPE_OFFICAL = 14;

    const BONUS_TYPE_FIXED = 0;
    const BONUS_TYPE_FLOAT = 1;


    const STATE_HIDE_SORT = 0;
    const STATE_EDIT_SORT = 1;

    const ACTION_NONE_MTT_CNF = 0;
    const ACTION_ADD_MTT_CNF = 1;
    const ACTION_VIEW_MTT_CNF = 2;
    const ACTION_EDIT_MTT_CNF = 3;

    const SIGNUPTYPE_MONEY=0;
    const SIGNUPTYPE_PROP=1;
    const SIGNUPTYPE_MONEYANDPROP=2;
    const WEEK_DAY_OPTIONS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']
    const WEEK_DAY_ENUM =[0,1,2,3,4,5,6]
    const SIGNUP_TYPE_ENUM=[
        {value:SIGNUPTYPE_MONEY,label:"金币报名"},
        {value:SIGNUPTYPE_PROP,label:"道具报名"},
        {value:SIGNUPTYPE_MONEYANDPROP,label:"金币和道具报名"},
        ]

    export  default {
        name:'mttconfig',
        data(){
            return {

                //展示的表数据
                tableData: [],
                errorTip: false,
                //单选框
                showDelChecked:false,
                signUpPropsList:[],
                matchTypeOptions:[
                    {value:MATCH_TYPE_MTT_REGULAR, label:'MTT 常规赛'},
                    {value:MATCH_TYPE_MTT_HUNTER, label:'MTT 猎人赛'},
                    {value:MATCH_TYPE_MTT_LADY,label:'MTT 女士赛'},
                    {value:MATCH_TYPE_MTT_FLIPOUT,label:'MTT 钱圈赛'},
                    {value:MATCH_TYPE_SNG_REGULAR,label:'SNG常规赛'},
                    {value:MATCH_TYPE_SNG_SPINGO,label:'SNG幸运赛'},
                    {value:MATCH_TYPE_REGULAR,label:'常规赛'},
                    {value:MATCH_TYPE_SELF_REGULAR,label:'自建常规赛'},
                    {value:MATCH_TYPE_SELF_SNG, label:'自建SNG'},
                    {value:MATCH_TYPE_SELF_MTT,label:'自建MTT'},
                    {value:MATCH_TYPE_TEAM, label:'官方团队赛'},
                    {value:MATCH_TYPE_MTT_LUCKY, label:'MTT幸运赛'},
                    {value:MATCH_TYPE_OFFLINE,label:'线下赛'},
                    {value:MATCH_TYPE_OFFICAL,label:'官方赛'},
                ],
                bonusTypeOptions:[
                    {value:BONUS_TYPE_FIXED, label:'固定奖金'},
                    {value:BONUS_TYPE_FLOAT, label:'浮动奖金'},
                ],



                //分页导航
                currentPage:0,
                pageSizeList:[10,20,30],
                pageSize:10,
                totalSize:0,

                //orderButton state
                orderState: STATE_HIDE_SORT,
                orderButtonLabel:"排序",

                //选择时间，选项框
                weekDaysOptions : WEEK_DAY_OPTIONS,
                isIndeterminate : false,
                weekDaycheckAll:false,
                fileList:[],
                signUpTypeOptions:SIGNUP_TYPE_ENUM,

                //盲注信息对话框数据
                editDialog:{
                    width:'400px',
                    show : false,
                    title: '赛事配置',
                    formLabelWidth:"150px",
                    disableEditState: false,
                    action: ACTION_ADD_MTT_CNF,
                    currentRowId:0
                },
                //基本配置
                //1.绑定对话框中的数据，但是需要转换
                rawForm:{
                    name:"",
                    weekDays:"",
                    intervalSec:"",
                    minPlayerNum:"",
                    maxPlayerNum:"",
                    listNum:0,  //显示场次数量
                    listImg:"", //展示列表图片
                    startTime:"",
                    endTime:"",
                    startDelaySec:0,
                    initChips:0,
                    blindId:0,
                    bettingSec:0,
                    suspendSec:0,
                    seatCnt:0,
                    startDate:"",  //指定比赛开始时间
                    matchType:"",
                    sortId:0,

                    signUpType:0, //报名方式
                    fee:0, //参赛费
                    tip:0, //服务费
                    signUpPropId:0,
                    signUpPropDesc:"",
                    signUpPropNum:0,
                    delaySignUpFlag:0,
                    delaySignUpLvl:0,
                    signUpConfirmFlag:0,

                    bonusType:0,
                    bonusId:0,
                    rewardId:0, //其他奖励id(实物，礼包，道具等奖励)
                    totalBonusInfo:"",
                    totalBonusUrl:"",
                    minBonus:0,
                    extraBonus:0,
                    pointFlag:0,
                    topRankImgs:"",
                    bountyId:0,

                    rebuyCnt:0,
                    rebuyLvl:0,
                    rebuyFee:0,
                    rebuyTip:0,
                    rebuyChip:0,
                    rebuyCondChip:0,
                    rebuyTimeout:0,
                    addonCnt:0,
                    addonLvl:0,
                    addonFee:0,
                    addonTip:0,
                    addonMutil:0,
                    reentryLvl:0,
                    reentryCnt:0,
                    bankBetCnt:0,
                },

                rules:{
                    sortId:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                        ],
                    minPlayerNum:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    maxPlayerNum:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    intervalSec:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    startDelaySec:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    initChips:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    blindId:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    bettingSec:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    suspendSec:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    fee:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    tip:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    seatCnt:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    minBonus:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    extraBonus:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyCnt:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyLvl:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyFee:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyTip:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyChip:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyCondChip:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    rebuyTimeout:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    addonCnt:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    addonLvl:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    addonFee:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    addonTip:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    addonMutil:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    reentryLvl:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    reentryCnt:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                    bankBetCnt:[
                        {type:'number',message:'请输入数字',trigger:'blur'},
                    ],
                },

                //2.需要提交API 的数据
                basic:{
                    name:"",
                    weekDays:"",
                    intervalSec:0,
                    minPlayerNum:0,
                    maxPlayerNum:0,
                    listNum:0,  //显示场次数量
                    listImg:"", //展示列表图片
                    startTime:"",
                    endTime:"",
                    startDelaySec:0,
                    initChips:0,
                    blindId:0,
                    bettingSec:0,
                    suspendSec:0,
                    seatCnt:0,
                    startDate:"",  //指定比赛开始时间
                    matchType:"",
                    sortId:0,

                },
                //报名配置
                signUp:{
                    signUpType:0, //报名方式
                    fee:0, //参赛费
                    tip:0, //服务费
                    signUpPropId:"",
                    signUpPropDesc:"",
                    signUpPropNum:0,
                    delaySignUpFlag:0,
                    delaySignUpLvl:0,
                    signUpConfirmFlag:0,
                },
                //奖励配置
                bonus:{
                    bonusType:0,
                    bonusId:0,
                    rewardId:0, //其他奖励id(实物，礼包，道具等奖励)
                    totalBonusInfo:"",
                    totalBonusUrl:"",
                    minBonus:0,
                    extraBonus:0,
                    pointFlag:0,
                    topRankImgs:"",
                    bountyId:0,
                },
                //特殊规则配置
                specialRule:{
                    rebuyCnt:0,
                    rebuyLvl:0,
                    rebuyFee:0,
                    rebuyTip:0,
                    rebuyChip:0,
                    rebuyCondChip:0,
                    rebuyTimeout:0,
                    addonCnt:0,
                    addonLvl:0,
                    addonFee:0,
                    addonTip:0,
                    addonMutil:0,
                    reentryLvl:0,
                    reentryCnt:0,
                    bankBetCnt:0,
                }

            }
        },

        methods:{
            //处理排序事件
            formatter(row, column) {
                return row.address;
            },
            //处理排序按钮点击事件
            handleClickOrderBy(){
                if(STATE_HIDE_SORT == this.orderState){
                    this.orderState = STATE_EDIT_SORT
                    this.orderButtonLabel = "提交排序"
                }else{
                    this.orderState = STATE_HIDE_SORT
                    this.orderButtonLabel = "排序"
                }
            },
            handleClickAddTo(){
                this.editDialog.show = true
                this.editDialog.action = ACTION_ADD_MTT_CNF
                console.log("here")
            },

            //选择星期几全选框
            handleCheckAllChange(val) {
                this.rawForm.weekDays = val ? WEEK_DAY_ENUM : [];
                this.isIndeterminate = false;
            },
            //选择星期几多选框
            handleCheckedCitiesChange(value) {
                let checkedCount = value.length;
                this.weekDaycheckAll = checkedCount === this.weekDaysOptions.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.weekDaysOptions.length;
            },
            //处理文件上传
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePreview(file) {
                console.log(file);
            },
            handleExceed(files, fileList) {
                this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
            },
            beforeRemove(file, fileList) {
                return this.$confirm(`确定移除 ${ file.name }？`);
            },
            //编辑对话框取消按钮
            handleEditDialogClickCancel(){

            },

            //编辑对话框确认按钮
            handleEditDialogClickConfirm(){
                //校验数据

                //weekday数据转化
                this.basic.weekDays = ""
                for(let i = 0; i < this.rawForm.weekDays.length; i++){
                   this.basic.weekDays += (this.rawForm.weekDays[i].toString() + ",")
                }

                //格式化时间
                this.basic.startTime = this.rawForm.startTime? this.rawForm.startTime.Format('yyyy-MM-dd hh:mm:ss') : ""
                this.basic.endTime = this.rawForm.endTime?this.rawForm.endTime.Format('yyyy-MM-dd hh:mm:ss'):""
                this.basic.startDate = this.rawForm.startDate?this.rawForm.startDate.Format('yyyy-MM-dd hh:mm:ss'):""
                this.basic.bettingSec = this.rawForm.bettingSec
                this.basic.blindId = this.rawForm.blindId
                this.basic.initChips = this.rawForm.initChips
                this.basic.intervalSec = this.rawForm.intervalSec
                this.basic.listNum = this.rawForm.listNum
                this.basic.listImg = this.rawForm.listImg
                this.basic.matchType = this.rawForm.matchType
                this.basic.maxPlayerNum = this.rawForm.maxPlayerNum
                this.basic.minPlayerNum = this.rawForm.minPlayerNum
                this.basic.name = this.rawForm.name
                this.basic.seatCnt = this.rawForm.seatCnt
                this.basic.suspendSec = this.rawForm.suspendSec

                this.signUp.delaySignUpFlag = this.rawForm.delaySignUpFlag
                this.signUp.delaySignUpLvl = this.rawForm.delaySignUpLvl
                this.signUp.fee = this.rawForm.fee
                this.signUp.tip = this.rawForm.tip
                this.signUp.signUpConfirmFlag = this.rawForm.signUpConfirmFlag
                this.signUp.signUpPropDesc = this.rawForm.signUpPropDesc
                this.signUp.signUpPropId = this.rawForm.signUpPropId
                this.signUp.signUpPropNum = this.rawForm.signUpPropNum

                this.bonus.bonusId = this.rawForm.bonusId
                this.bonus.bonusType = this.rawForm.bonusType
                this.bonus.bountyId = this.rawForm.bountyId
                this.bonus.extraBonus = this.rawForm.extraBonus
                this.bonus.minBonus = this.rawForm.minBonus
                this.bonus.rewardId = this.rawForm.rewardId
                this.bonus.pointFlag = this.rawForm.pointFlag
                this.bonus.topRankImgs = this.rawForm.topRankImgs
                this.bonus.totalBonusInfo = this.rawForm.totalBonusInfo
                this.bonus.totalBonusUrl = this.rawForm.totalBonusUrl


                this.specialRule.bankBetCnt = this.rawForm.bankBetCnt
                this.specialRule.addonTip = this.rawForm.addonTip
                this.specialRule.addonCnt = this.rawForm.addonCnt
                this.specialRule.addonMutil = this.rawForm.addonMutil
                this.specialRule.addonLvl = this.rawForm.addonLvl
                this.specialRule.rebuyTimeout = this.rawForm.rebuyTimeout
                this.specialRule.rebuyTip = this.rawForm.rebuyTip
                this.specialRule.rebuyChip = this.rawForm.rebuyChip
                this.specialRule.rebuyLvl = this.rawForm.rebuyLvl
                this.specialRule.rebuyFee = this.rawForm.rebuyFee
                this.specialRule.reentryCnt = this.rawForm.reentryCnt
                this.specialRule.reentryLvl = this.rawForm.reentryLvl


                //提交数据
                let data = {
                    "basic":this.basic,
                    "signUp":this.signUp,
                    "bonus":this.bonus,
                    "specialRule":this.specialRule,
                }
                axios({
                     type:'post',
                     path:'/api/mtts/',
                     data:data,
                     fn:data=>{
                        this.getList(this.currentPage, this.pageSize)
                     }
                 })

                this.editDialog.show=false;
            },


            //改变单页展示数量
            handleSizeChange(val) {
                //console.log(`每页 ${val} 条`);
                this.pageSize = val
                this.currentPage = 1
                this.getList(this.currentPage,this.pageSize)
            },
            //改变页码
            handleCurrentChange(val) {
                //console.log(`当前页: ${val}`);
                this.currentPage = val
                this.getList(this.currentPage,this.pageSize)
            },

            //下拉菜单命令
            handleCommand(command){
                console.log(command)
            },

            //选择
            handleSelectionChange(val) {
                console.log(val)
            },
            checkNumber(value){
                console.log(value)
                let reg = /^[1-9]\d*$/;
                if (value){
                    if (new RegExp(reg).test(value) == false) {
                            alert("请输入数字")
                    }
                }
            },
            //获得当前页数据
            getList(pageNum, pageSize){

            }


        }
    }
</script>

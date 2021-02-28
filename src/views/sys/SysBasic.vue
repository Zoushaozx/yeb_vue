<template>
    <div>
        <template>
            <el-tabs v-model="activeName" type="card">
                <el-tab-pane label="部门管理" name="DepMenu"><DepMenu></DepMenu></el-tab-pane>
                <el-tab-pane label="职位管理" name="PosMenu"><PosMenu></PosMenu></el-tab-pane>
                <el-tab-pane label="职称管理" name="JoblevelMenu"><JoblevelMenu></JoblevelMenu></el-tab-pane>
                <el-tab-pane label="奖惩规则" name="EcMenu"><EcMenu></EcMenu></el-tab-pane>
                <el-tab-pane label="权限组" name="PermissMenu"><PermissMenu></PermissMenu></el-tab-pane>
            </el-tabs>
        </template>
    </div>
</template>

<script>
    import DepMenu from '../../components/sys/basic/DepMenu'
    import EcMenu from '../../components/sys/basic/EcMenu'
    import JoblevelMenu from '../../components/sys/basic/JoblevelMenu'
    import PermissMenu from '../../components/sys/basic/PermissMenu'
    import PosMenu from '../../components/sys/basic/PosMenu'

    export default {
        name: "SysBasic",
        data() {
            return {
                activeName: 'DepMenu'
            }
        },
        components: {
            DepMenu,
            EcMenu,
            JoblevelMenu,
            PermissMenu,
            PosMenu
        }
    }
</script>

<style scoped>

</style>
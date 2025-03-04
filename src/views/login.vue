<template>
  <div class="login-container">
    <div class="background"></div>
    <div class="login">
      <div class="logo-wrapper">
        <img v-if="logo" :src="logo" class="sidebar-logo" />
      </div>
      <div class="logo-container">
        <h3 class="title">深度云学习平台</h3>
      </div>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            type="text"
            auto-complete="off"
            placeholder="账号"
          >
            <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled" class="captcha-item">
          <el-input
            v-model="loginForm.code"
            auto-complete="off"
            placeholder="验证码"
            style="width: 67%; display: inline-block;"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </el-input>
          <div class="login-code" style="display: inline-block; margin-left: 10px;">
            <img :src="codeUrl" @click="getCode" class="login-code-img"/>
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
          <el-button
            :loading="loading"
            size="medium"
            type="primary"
            style="width:100%; height: 80px"
            @click.native.prevent="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div style="float: right;" v-if="register">
            <router-link class="link-type" :to="'/register'">立即注册</router-link>
          </div>
        </el-form-item>
      </el-form>
      <!--  底部  -->
      <div class="el-login-footer">
        <span>Copyright www.miaoxiangkeji.com 北京市妙想科技有限公司 (C)2006-2016 ALL RIGHTS RESERVED 京ICP备11016777号-1</span>
      </div>
    </div>
  </div>
</template>


<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import logoImg from '@/assets/logo/miaoxiang.png'

export default {
  name: "Login",
  data() {
    return {
      logo: logoImg,
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaEnabled: true,
      // 注册开关
      register: false,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created() {
    this.getCode();
    this.getCookie();
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        if (this.captchaEnabled) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove('rememberMe');
          }
          this.$store.dispatch("Login", this.loginForm).then(() => {
            this.$router.push({ path: this.redirect || "/" }).catch(()=>{});
          }).catch(() => {
            this.loading = false;
            if (this.captchaEnabled) {
              this.getCode();
            }
          });
        }
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.captcha-item {
  display: flex;
  align-items: center; // 确保输入框和验证码图片垂直居中
}

.login-code {
  width: 30%;
  margin-left: 30px;
}

.login-code-img {
  height: auto; // 设置验证码图片的高度
  width: auto; // 保持宽高比
  cursor: pointer; // 鼠标悬停时显示为手型
  vertical-align: middle; // 确保图片垂直对齐
  padding: 5px;
}

.login-container {
  display: flex;
  height: 100vh;

  .background {
    width: 70%;
    background-image: url("../assets/images/miaoxiang-background-logo.jpg");
    background-size: cover;
  }

  .login {
    width: 30%;
    background: #ffffff;
    //display: flex;
    flex-direction: column;

    padding: 25px;

    .logo-container {
      text-align: center;
      margin-bottom: 30px;
      justify-content: center;
      .title {
        font-weight: bolder;
        color: #707070;
        font-size: 24px;
      }
    }

    .login-form {
      width: 100%;
      .el-input {
        min-height: 70px;
        height: 100%;
        input {
          min-height: 70px;
          height: 100%;
          padding-left: 100px;
        }
      }
      .input-icon {
        height: 70px;
        width: 28px;
        margin-left: 20px;
      }
    }

    .el-login-footer {
      height: 40px;
      line-height: 40px;
      position: relative;
      width: 100%;
      text-align: center;
      color: #000;
      font-family: Arial;
      font-size: 12px;
      letter-spacing: 1px;
    }
  }
}
.logo-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.sidebar-logo {
  margin-bottom: 10px; // 根据需要调整 logo 和标题之间的间距
}
</style>


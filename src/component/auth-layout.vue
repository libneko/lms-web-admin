<script setup lang="ts"></script>

<template>
  <div class="auth-container">
    <div class="image-side">
      <img src="https://neko-book.oss-cn-hangzhou.aliyuncs.com/background.jpg" />
    </div>
    <div class="form-side">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100%;
  background-color: rgba(250, 204, 204, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.image-side {
  border-radius: 20px;
  margin-right: -60px;
  z-index: 1;
  flex-shrink: 1;
}

.image-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
}

.form-side {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  box-shadow: var(--el-box-shadow);
  padding: 40px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .image-side {
    margin-right: -80px;
  }
}

@media (max-width: 900px) {
  .image-side {
    margin-right: -100px;
  }
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .image-side {
    margin-right: 0;
    margin-bottom: -40px;
  }
}
</style>

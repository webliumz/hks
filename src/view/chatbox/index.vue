<template>
  <div class="chat-container">
    <div class="templateManage">
      <div class="template_title rainbow-template_title">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="个性化学习助理" name="first">
            <div class="bck">
              <div class="chat-let">
                <div style="width: 200px">
                  <div>
                    <img src="../../assets/toux.jpg" alt=""
                      style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                  </div>
                  <div class="label">当前教学目标：133</div>
                  <div class="label">学生目标：考上北大</div>
                  <div class="label">兴趣点：喜欢数学</div>
                  <div class="label">特长：对数字敏感</div>
                  <div class="label">薄弱项</div>
                </div>
              </div>
              <div class="chat-list">
                <div>
                  <div class="self">
                    你好，我是你的智能学习陪伴成长小助理。基于你的班主任和代课老师预先配置的教学大纲、教学计划，以及你自己的个性化的学习兴趣、特长和想要成为的目标，共同进行知识定制和试题测验。你可以问我跟你学所有学习相关的问题，我来为你进行疑难解答～
                  </div>
                </div>
                <div v-for="item in formattedChatList" :key="item.id">
                  <div v-html="item.content" :class="item.sender === 'self' ? 'self' : 'self2'"></div>
                </div>
              </div>
            </div>
            <div class="input-box" v-if="isAdmin">
              <input type="text" v-model="inputContent" @keyup.enter="sendMsg" ref="autoFocusInput"
                placeholder="请输入意见问题，如最重要的意见是什么，最有价值的意见是什么...">
              <button @click="sendMsg">发送</button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="AI生成考题" name="second">
            <div style="height: 400px; overflow-y: scroll;">
              <form v-for="(question, qIndex) in questions" :key="qIndex">
                <div>
                  <p>{{ qIndex + 1 }}. {{ question.text }}</p>
                  <div v-for="(option, oIndex) in question.options" :key="oIndex">
                    <input :type="question.type" :name="'question' + qIndex" :value="option.value"
                      v-model="answers[qIndex]" @change="updateAnswer(qIndex, option.value)">
                    <label>{{ option.text }}</label><br>
                  </div>
                </div>
              </form>
            </div>
            <div style="padding:100px"> <button @click="submitAll">提交所有答案</button></div>
            <div style="padding:100px"> <button @click="generateMathQuestions">生成问题</button></div>
          </el-tab-pane>
          <el-tab-pane label="学习旅程报告" name="third">
            <div style="height: calc(100vh - 80px); overflow-y: auto;">
              <div style="display: flex;">
                <div style="width: 360px; height: 364px; margin-left: 200px;">
                  <img src="../../assets/toux.jpg" alt="" style="width: 240px; height: 244px;">
                </div>
                <div>
                  <div>
                    <p style="color: #181818; font-size: 28px;">综合得分</p>
                  </div>
                  <div>
                    <p style="color: #181818; font-size: 80px; font-weight: 600;"> 300</p>
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center; font-size: 28px;">薄弱点分析</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center; font-size: 28px;">个人目标诊断</p>
                </div>
                <div style="text-align: center;" v-html="PersonalGoal">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center; font-size: 28px;">性格特质分析</p>
                </div>
                <div style="text-align: center;" v-html="CharacterTraits">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center; font-size: 28px;">强项分析</p>
                </div>
                <div style="text-align: center;" v-html="Competency">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center; font-size: 28px;">个性化成长建议</p>
                </div>
                <div style="text-align: center;" v-html="Suggestions">
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="弱项修炼" name="fourth">
            <div style="height: calc(100vh - 80px); overflow-y: auto;">
              <div v-for="(item, index) in WeakItemPractice" :key="index">
                <p style="padding:20rpx 0">{{ item[0] }}</p>
                <form v-for="(question, qIndex) in item[1]" :key="qIndex">
                  <div>
                    <p>{{ qIndex + 1 }}. {{ question.text }}</p>
                    <div v-for="(option, oIndex) in question.options" :key="oIndex">
                      <input :type="question.type" :name="'question' + qIndex" 
                        v-model="answers[qIndex]" @change="updateAnswer(qIndex, option.value)">
                      <label>{{ option.text }}</label><br>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import marked from 'marked';
import { jsonrepair } from 'jsonrepair';
export default {
  data() {
    return {
      chatList: [],
      inputContent: '',
      companyInfo: null,
      chatMessage: '',
      message_temp: '',
      comments: [],
      WeakItemPractice: [],
      box: {},
      isAdmin: true,
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      bearerToken: '195f1024434c02281265b4d0e5fea5d2.bkU3NoQDIHilnJvr',
      activeName: 'first',
      answers: [], // 存储答案的数组
      WeakPoint: '',
      PersonalGoal: '',
      CharacterTraits: '',
      Competency: '',
      Suggestions: '',
      reports: {},
      reportPrompts: [
        { prompt: '关于数学学科薄弱点', property: 'WeakPoint' },
        { prompt: '关于数学学科个人目标', property: 'PersonalGoal' },
        { prompt: '性格特质', property: 'CharacterTraits' },
        { prompt: '强项分析', property: 'Competency' },
        { prompt: '个性化成长建议', property: 'Suggestions' }
      ],
      questions: [
        {
          "text": "1. 一共有15个苹果，小明吃了4个，还剩多少个？",
          "type": "radio",
          "options": [
            { "text": "A. 9", "value": "A" },
            { "text": "B. 11", "value": "B" },
            { "text": "C. 12", "value": "C" },
            { "text": "D. 10", "value": "D" }
          ],
          "answers": "B"
        },
        {
          "text": "2. 小红有8颗糖，小明有5颗糖，他们一共有多少颗糖？",
          "type": "radio",
          "options": [
            { "text": "A. 12", "value": "A" },
            { "text": "B. 13", "value": "B" },
            { "text": "C. 14", "value": "C" },
            { "text": "D. 15", "value": "D" }
          ],
          "answers": "C"
        },
        {
          "text": "3. 7加3等于多少？",
          "type": "radio",
          "options": [
            { "text": "A. 9", "value": "A" },
            { "text": "B. 10", "value": "B" },
            { "text": "C. 11", "value": "C" },
            { "text": "D. 8", "value": "D" }
          ],
          "answers": "B"
        },
        {
          "text": "4. 20减去8等于多少？",
          "type": "radio",
          "options": [
            { "text": "A. 11", "value": "A" },
            { "text": "B. 12", "value": "B" },
            { "text": "C. 13", "value": "C" },
            { "text": "D. 14", "value": "D" }
          ],
          "answers": "B"
        },
        {
          "text": "5. 有两个长方形，一个长4厘米，宽2厘米，另一个长3厘米，宽2厘米，两个长方形的面积和是多少平方厘米？",
          "type": "radio",
          "options": [
            { "text": "A. 12", "value": "A" },
            { "text": "B. 14", "value": "B" },
            { "text": "C. 16", "value": "C" },
            { "text": "D. 18", "value": "D" }
          ],
          "answers": "C"
        },
        {
          "text": "6. 5乘6等于多少？",
          "type": "radio",
          "options": [
            { "text": "A. 25", "value": "A" },
            { "text": "B. 30", "value": "B" },
            { "text": "C. 35", "value": "C" },
            { "text": "D. 40", "value": "D" }
          ],
          "answers": "B"
        },
        {
          "text": "7. 15除以3等于多少？",
          "type": "radio",
          "options": [
            { "text": "A. 4", "value": "A" },
            { "text": "B. 5", "value": "B" },
            { "text": "C. 6", "value": "C" },
            { "text": "D. 7", "value": "D" }
          ],
          "answers": "B"
        },
        {
          "text": "8. 平行四边形的对边是相等的吗？",
          "type": "radio",
          "options": [
            { "text": "A. 是", "value": "A" },
            { "text": "B. 不是", "value": "B" },
            { "text": "C. 不一定", "value": "C" },
            { "text": "D. 看情况", "value": "D" }
          ],
          "answers": "A"
        },
        {
          "text": "9. 9乘以4是多少？",
          "type": "radio",
          "options": [
            { "text": "A. 32", "value": "A" },
            { "text": "B. 34", "value": "B" },
            { "text": "C. 35", "value": "C" },
            { "text": "D. 36", "value": "D" }
          ],
          "answers": "D"
        },
        {
          "text": "10. 正方形有多少条边？",
          "type": "radio",
          "options": [
            { "text": "A. 3", "value": "A" },
            { "text": "B. 4", "value": "B" },
            { "text": "C. 5", "value": "C" },
            { "text": "D. 6", "value": "D" }
          ],
          "answers": "B"
        }
      ]
    };
  },
  computed: {
    formattedChatList() {
      return this.chatList.map(item => {
        const newItem = { ...item };
        if (item.sender !== 'self') {
          newItem.content = marked(item.content);
        }
        return newItem;
      });
    }
  },
  created() {
    // 初始化answers数组
    this.questions.forEach((question, index) => {
      this.answers.push('');
    });
    // 循环调用getReport获取各类报告
    this.reportPrompts.forEach(report => {
      this.getReport(report.prompt, report.property);
    });
    this.getWeakItemPractice();
    this.generateMathQuestions()
  },
  methods: {
    async getReport(prompt, propertyName) {
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const bearerToken = 'b670f1c246f11bf5bec96d84589784e0.fAprNoe7qoAOPkpW';
      try {
        const data = {
          model: "GLM-4-0520",
          messages: [
            {
              role: 'user',
              content: `帮我生成一个 ${prompt} 的提示语，我的目标对象是小学生，你尽可能的表现亲切一些（内容支持换行）`
            }
          ]
        };
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result.choices[0].message.content);
        // 使用 marked 解析 Markdown 并赋值给对应属性
        this[propertyName] = marked(result.choices[0].message.content);
      } catch (error) {
        console.error(`Error fetching ${propertyName}:`, error);
        throw error;
      }
    },
    async generateMathQuestions() {
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const bearerToken = 'b670f1c246f11bf5bec96d84589784e0.fAprNoe7qoAOPkpW';
      try {
        const data = {
          model: "GLM-4-0520",
          messages: [
            {
              role: 'user',
              content: `请帮我生成10个小学三年级的数学单选题，要求如下：
- 只返回标准的 JSON 数据，不要包含任何额外的文字、说明或格式符号（如 Markdown 代码块）。
- JSON 数据的格式如下：
[
  {
    "text": "题目内容",
    "type": "radio",
    "options": [
      { "text": "A. 选项内容", "value": "A" },
      { "text": "B. 选项内容", "value": "B" },
      { "text": "C. 选项内容", "value": "C" },
      { "text": "D. 选项内容", "value": "D" }
    ],
    "answers": "正确答案的选项字母"
  },
  // ...其他题目
]
请直接返回 JSON 数据，不要包含任何多余的文字或格式符号。`
            }
          ]
        };
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log(result);
        let jsonString = result.choices[0].message.content;
        jsonString = jsonString.replace(/```json\s*([\s\S]*?)\s*```/, '$1');
        jsonString = jsonString.replace(/```[\s\S]*?```/, '$1');
        jsonString = jsonString.trim();
        const repairedJsonString = jsonrepair(jsonString);
        let questions;
        try {
          questions = JSON.parse(repairedJsonString);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.log('Problematic JSON string:', repairedJsonString);
          throw parseError;
        }
        this.questions = questions;
        return questions;
      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    },
    updateAnswer(index, value) {
      // 更新指定问题的答案
      this.answers[index] = value;
    },
    submitAll() {
      // 提交所有问题和答案
      let score = 0;
      this.questions.forEach((question, index) => {
        if (this.answers[index] === question.answers) {
          score++;
        }
      });
      console.log('得分:', score, '总分:', this.questions.length);
      // 在这里发送请求到服务器或执行其他提交逻辑
    },
    updateAnswer(index, value) {
      // 更新指定问题的答案
      this.answers[index] = value;
    },
    submitAll() {
      // 提交所有问题和答案
      let score = 0;
      this.questions.forEach((question, index) => {
        if (this.answers[index] === question.answers) {
          score++;
        }
      });
      console.log('得分:', score, '总分:', this.questions.length);
      // 在这里发送请求到服务器或执行其他提交逻辑
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async chat(question, index) {
      let commentString = this.comments.map((comment, idx) => `${idx}:${comment.comment}`).join('/');
      const data = {
        model: "glm-4",
        messages: [
          {
            role: 'user',
            content: question
          }
        ],
        stream: true,
      };
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) {
          console.error('Network response was not ok:', response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let streamData = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          streamData += decoder.decode(value, { stream: true });
          const cleanData = streamData.replace(/data: /g, '');
          this.processStreamData(cleanData, index);
          this.$nextTick(() => {
            this.$refs.chatList.scrollTop = this.$refs.chatList.scrollHeight;
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    },
    processStreamData(streamData, index) {
      try {
        const regex = /"content":"(.*?)"/g;
        let match;
        let resultString = '';
        while ((match = regex.exec(streamData)) !== null) {
          const contentValue = match[1].replace(/\\n/g, '\n').replace(/undefined/g, '');
          resultString += contentValue;
        }
        if (resultString) {
          this.chatList[index].content = resultString;
        }
      } catch (error) {
        console.error('Error processing stream data:', error);
      }
    },
    sendMsg() {
      if (this.inputContent.trim() === '') {
        return;
      }
      let min = 1;
      let max = 10;
      let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      const msg = {
        id: randomNumber,
        sender: 'self',
        content: this.inputContent
      };
      this.chatList.push(msg);
      this.inputContent = '';
      this.reply(msg.content);
    },
    reply(content) {
      const replyContent = `您好，关于您的提问："${content}"，我的回答是：...`;
      let min = 1;
      let max = 100000000;
      let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      const msg = {
        id: randomNumber,
        sender: 'ai',
        content: "思考中..."
      };
      this.chatList.push(msg);
      var chatListIndex = this.chatList.length - 1;
      this.chat(content, chatListIndex);
      this.$nextTick(() => {
        this.$refs.chatList.scrollTop = this.$refs.chatList.scrollHeight;
      });
    },
    async getWeakItemPractice() {
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const bearerToken = 'b670f1c246f11bf5bec96d84589784e0.fAprNoe7qoAOPkpW';
      const maxRetries = 3; // 最多重试次数
      for (let i = 0; i < 5; i++) {
        try {
          const data = {
            model: "GLM-4-0520",
            messages: [
              {
                role: 'user',
                content: `帮我随机生成一条 小学生数学学科的薄弱点 能够举出具体的点最好`
              }
            ]
          };
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.json();
          const weakPoint = result.choices[0].message.content;
          let retryCount = 0;
          let question = null;
          while (retryCount < maxRetries) {
            try {
              const questionData = {
                model: "GLM-4-0520",
                messages: [
                  {
                    role: 'user',
                    content: `根据以下薄弱点生成1个小学的数学单选题,你要发挥想象，要求如下：
- 只返回标准的 JSON 数据，不要包含任何额外的文字、说明或格式符号（如 Markdown 代码块）。
- JSON 数据的格式如下：
[
  {
    "text": "题目内容",
    "type": "radio",
    "options": [
      { "text": "A. 选项内容", "value": "A" },
      { "text": "B. 选项内容", "value": "B" },
      { "text": "C. 选项内容", "value": "C" },
      { "text": "D. 选项内容", "value": "D" }
    ],
    "answers": "正确答案的选项字母"
  }
]
请直接返回 JSON 数据，不要包含任何多余的文字或格式符号。
薄弱点如下：${weakPoint}`
                  }
                ]
              };
              const questionResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${bearerToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(questionData)
              });
              if (!questionResponse.ok) {
                throw new Error(`HTTP error! Status: ${questionResponse.status}`);
              }
              const questionResult = await questionResponse.json();
              const questionContent = questionResult.choices[0].message.content;
              question = JSON.parse(questionContent);
              break;
            } catch (parseError) {
              retryCount++;
              console.warn(`第 ${retryCount} 次尝试解析题目数据失败，正在重试...`);
              if (retryCount === maxRetries) {
                throw new Error('无法获取有效的题目数据，已达到最大重试次数');
              }
            }
          }
          this.WeakItemPractice.push([weakPoint, question]);
          console.log(this.WeakItemPractice);
        } catch (error) {
          console.error('Error fetching questions:', error);
          continue;
        }
      }
    },
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
  overflow: hidden;
}

.templateManage {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  margin-bottom: 10px;
}

.template_title {
  flex-grow: 1;
  height: auto;
  line-height: normal;
  padding: 0;
}

.main-content {
  display: flex;
  flex: 1;
}

.chat-let {
  width: 150px;
  height: 100vh;
  background: #007bff;
  padding: 20px;
}

.bck {
  display: flex;
}

.chat-list {
  padding: 20px;
  background-color: #f8f8f8;
  width: 1100px;
}

.chat-item {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.self,
.self2 {
  margin-bottom: 10px;
  padding: 20px;
  border-radius: 15px;
}

.self {
  align-self: flex-end;
  background: #409EFF;
  color: #fff;
  min-width: 10px;
  max-width: 100%;
  width: auto;
}

.self2 {
  align-self: flex-start;
  background: radial-gradient(148% 148% at 32% 9%, rgba(65, 131, 182, 0.26) 0%, rgb(239 254 255) 100%);
}

.input-box {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-top: 1px solid #cbcbcb;
  position: fixed;
  bottom: 0;
  width: calc(100vw - 50px);
}

.input-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #cbcbcb;
  border-radius: 15px;
  margin-right: 10px;
}

.input-box button {
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  background-color: #409EFF;
  color: #fff;
  cursor: pointer;
}

.label {
  color: #f9f9f9;
  margin: 10px 0;
}
</style>

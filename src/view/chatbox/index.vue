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
                  <div class="label">当前教学目标:133</div>
                  <div class="label">学生目标:考上北大</div>
                  <div class="label">兴趣点</div>
                  <div class="label">特长</div>
                  <div class="label">薄弱项</div>
                </div>
              </div>
              <div class="chat-list">
                <div  >
                  <div class="self">你好，我是你的智能学习陪伴成长小助理。基于你的班主任和代课老师预先配置的教学大纲、教学计划，以及你自己的个性化的学习兴趣、特长和想要成为的目标，共同进行知识定制和试题测验。你可以问我跟你学所有学习相关的问题，我来为你进行疑难解答～</div>
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
            <div style="height: calc(100vh - 80px) ;overflow-y: auto;">
              <div style="display: flex;">
                <div style="width: 360px;height: 364px;margin-left: 200px;">
                  <img src="../../assets/toux.jpg" alt="" style="width: 240px;height: 244px;">
                </div>
                <div>
                  <div>
                    <p style="color: #181818;font-size: 28px;">综合得分</p>
                  </div>
                  <div>
                    <p style="color: #181818;font-size: 80px;font-weight: 600;"> 300</p>

                  </div>
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center;font-size: 28px;">薄弱点分析</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center;font-size: 28px;">个人目标诊断</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center;font-size: 28px;">性格特质分析</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center;font-size: 28px;">强项分析</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
              <div>
                <div>
                  <p style="text-align: center;font-size: 28px;">个性化成长建议</p>
                </div>
                <div style="text-align: center;" v-html="WeakPoint">
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="弱项修炼" name="fourth">
            <div style="height: calc(100vh - 80px) ;overflow-y: auto;">
              <div v-for="(item, index) in WeakItemPractice" :key="index">
                <p style="padding:20rpx 0">{{ item[0] }}</p>
                
                <form v-for="(question, qIndex) in item[1]" :key="qIndex">
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
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import marked from 'marked';
import { Configuration, OpenAIApi } from 'openai';
// import jsonrepair from 'jsonrepair';
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
      activeName: 'third',
      answers: [], // 存储答案的对象
      WeakPoint: '',
      questions: [
        {
          text: '下列哪个数字与50最接近？',
          type: 'radio',
          options: [
            { text: 'A. 42', value: 'A' },
            { text: 'B. 55', value: 'B' },
            { text: 'C. 60', value: 'C' },
            { text: 'D. 65', value: 'D' },
          ],
          answers: 'B'
        },
        {
          text: '小明有18个苹果，他给了小红一些苹果后还剩9个，小明给了小红多少个苹果？',
          type: 'radio',
          options: [
            { text: 'A. 5', value: 'A' },
            { text: 'B. 9', value: 'B' },
            { text: 'C. 10', value: 'C' },
            { text: 'D. 18', value: 'D' },
          ],
          answers: 'C'
        },
        {
          text: '2个十和5个个位数组成的多位数是多少？',
          type: 'radio',
          options: [
            { text: 'A. 25', value: 'A' },
            { text: 'B. 20', value: 'B' },
            { text: 'C. 52', value: 'C' },
            { text: 'D. 65', value: 'D' },
          ],
          answers: 'A'
        },
        {
          text: '下列哪个数字最小？',
          type: 'radio',
          options: [
            { text: 'A. 23', value: 'A' },
            { text: 'B. 32', value: 'B' },
            { text: 'C. 42', value: 'C' },
            { text: 'D. 53', value: 'D' },
          ],
          answers: 'A'
        },
        {
          text: '一个长方形的长是5厘米，宽是3厘米，它的周长是多少厘米？',
          type: 'radio',
          options: [
            { text: 'A. 16厘米', value: 'A' },
            { text: 'B. 18厘米', value: 'B' },
            { text: 'C. 20厘米', value: 'C' },
            { text: 'D. 24厘米', value: 'D' },
          ],
          answers: 'D'
        },
        {
          text: '小华有15个橘子，他每天吃3个，吃完这些橘子需要多少天？',
          type: 'radio',
          options: [
            { text: 'A. 4天', value: 'A' },
            { text: 'B. 5天', value: 'B' },
            { text: 'C. 6天', value: 'C' },
            { text: 'D. 7天', value: 'D' },
          ],
          answers: 'B'
        },
        {
          text: '下列哪个数字能被2整除？',
          type: 'radio',
          options: [
            { text: 'A. 13', value: 'A' },
            { text: 'B. 15', value: 'B' },
            { text: 'C. 16', value: 'C' },
            { text: 'D. 17', value: 'D' },
          ],
          answers: 'C'
        },
        {
          text: '妈妈买了8个鸡蛋，每个鸡蛋可以孵出一只小鸡，孵出的小鸡有多少只？',
          type: 'radio',
          options: [
            { text: 'A. 1只', value: 'A' },
            { text: 'B. 8只', value: 'B' },
            { text: 'C. 16只', value: 'C' },
            { text: 'D. 32只', value: 'D' },
          ],
          answers: 'B'
        },
        {
          text: '一个正方形的边长是4厘米，它的面积是多少平方厘米？',
          type: 'radio',
          options: [
            { text: 'A. 8平方厘米', value: 'A' },
            { text: 'B. 16平方厘米', value: 'B' },
            { text: 'C. 24平方厘米', value: 'C' },
            { text: 'D. 32平方厘米', value: 'D' },
          ],
          answers: 'B'
        },
        {
          text: '小刚有10块巧克力，他想平均分给5个朋友，每个朋友能得到几块巧克力？',
          type: 'radio',
          options: [
            { text: 'A. 1块', value: 'A' },
            { text: 'B. 2块', value: 'B' },
            { text: 'C. 3块', value: 'C' },
            { text: 'D. 4块', value: 'D' },
          ],
          answers: 'B'
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
    this.getWeakPoint()
    this.getWeakItemPractice()
  },
  methods: {
    async getWeakPoint() {
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const bearerToken = 'b670f1c246f11bf5bec96d84589784e0.fAprNoe7qoAOPkpW';
      try {
        const data = {
          model: "GLM-4-0520",
          messages: [
            {
              role: 'user',
              content: `帮我生成一个 关于数学学科薄弱点的 提示语，我的目标对象是小学生，你尽可能的表现亲切一些（内容支持换行）`
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

        // 使用 marked 解析 Markdown 并赋值给 WeakPoint
        this.WeakPoint = marked(result.choices[0].message.content);

      } catch (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
    },

    // 新增方法：将文本解析为Markdown格式
    renderMarkdown(text) {
      // 这里你可以使用任何Markdown解析库，比如marked.js
      // 以下是一个简单的示例，你可能需要根据实际情况进行调整
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
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

        // 获取 JSON 字符串
        let jsonString = result.choices[0].message.content;

        // 去除可能存在的 Markdown 代码块符号
        jsonString = jsonString.replace(/```json\s*([\s\S]*?)\s*```/, '$1');
        jsonString = jsonString.replace(/```[\s\S]*?```/, '$1');

        // 移除多余的空格和换行符
        jsonString = jsonString.trim();

        // 使用 jsonrepair 修复 JSON 字符串
        const repairedJsonString = jsonrepair(jsonString);

        // 尝试解析修复后的 JSON
        let questions;
        try {
          questions = JSON.parse(repairedJsonString);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.log('Problematic JSON string:', repairedJsonString);
          throw parseError;
        }
        // console.log(questions);
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

    getSelectedCompany() {
      const selectedCompany = localStorage.getItem('SELECTCOMPANY');
      return selectedCompany ? JSON.parse(selectedCompany) : null;
    },

    sendMsg() {
      var that = this
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
      var that = this
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
      var chatListIndex = this.chatList.length - 1
      this.chat(content, chatListIndex)

      this.$nextTick(() => {
        this.$refs.chatList.scrollTop = this.$refs.chatList.scrollHeight;
      });
    },

    async getWeakItemPractice() {
      const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      const bearerToken = 'b670f1c246f11bf5bec96d84589784e0.fAprNoe7qoAOPkpW';
      const maxRetries = 3; // 最多重试次数

      for (let i = 0; i < 5; i++) { // 循环5次
        try {
          // 第一次请求，获取薄弱点
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

          // 初始化重试计数
          let retryCount = 0;
          let question = null;

          while (retryCount < maxRetries) {
            try {
              // 第二次请求，获取与薄弱点相关的题目
              const questionData = {
                model: "GLM-4-0520",
                messages: [
                  {
                    role: 'user',
                    content: `根据以下薄弱点生成1个小学三年级的数学单选题，要求如下：
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

              // 尝试解析返回的 JSON 数据
              question = JSON.parse(questionContent);
              // 如果解析成功，跳出重试循环
              break;
            } catch (parseError) {
              // 解析失败，可能返回的不是有效的 JSON 数据，重试
              retryCount++;
              console.warn(`第 ${retryCount} 次尝试解析题目数据失败，正在重试...`);
              if (retryCount === maxRetries) {
                throw new Error('无法获取有效的题目数据，已达到最大重试次数');
              }
            }
          }

          // 将薄弱点和对应的题目一起存储到 WeakItemPractice 二维数组中
          this.WeakItemPractice.push([weakPoint, question]);
          console.log(this.WeakItemPractice);
        } catch (error) {
          console.error('Error fetching questions:', error);
          // 根据需要决定是否在出错时中断循环，这里选择继续下一个循环
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  width: 1200px;
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
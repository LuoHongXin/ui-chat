// 主题配置
export const THEME_CONFIG = {
    // 默认主题模式：'dark'为暗黑模式，'light'为高亮模式
    defaultTheme: 'light'
};

// API配置
export const API_CONFIG = {
    // 请求超时时间（毫秒）
    timeout: 100000,
    appId: "wh5de3bcd828824b7",
    securityKey: "430412ff4f49450c8e2bbc1507730732",
    // API服务器地址，默认使用本地测试服务器
    API_SERVER: 'http://10.10.152.60',
    // API密钥，需要替换为实际的API Key
    API_KEY: 'ragflow-k4NjEzYWJjMGExZDExZjA4ZjdkYmUyNG',
    // 保存服务器地址，默认使用本地测试服务器
    // CURL_SERVER: 'http://rag-backend.192.168.101.190.nip.io',
    CURL_SERVER: '',
    authorization: 'ImNlOGJlZWFhMGM3YzExZjA4OTMxMzJjMGIyNWZlMDQ4Ig.Z-e3lg.blIpuKoeqEl9ExJxPOwfi-YJC58'
};

// 预设助理配置
export const ASSISTANTS = {
    "code": 0,
    "data": [
        {
            "create_date": "Wed, 26 Mar 2025 13:53:50 GMT",
            "create_time": 1742968430997,
            "description": "A helpful dialog",
            "do_refer": "1",
            "icon": "",
            "id": "b1592b900a0611f085c2be24a32214d8",
            "kb_ids": [],
            "kb_names": [],
            "language": "English",
            "llm_id": "forRAG_deepseek-7b___OpenAI-API@OpenAI-API-Compatible",
            "llm_setting": {
                "frequency_penalty": 0.7,
                "presence_penalty": 0.4,
                "temperature": 0.1,
                "top_p": 0.3
            },
            "name": "代理助手",
            "prompt_config": {
                "empty_response": "",
                "keyword": false,
                "parameters": [
                    {
                        "key": "knowledge",
                        "optional": false
                    }
                ],
                "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
                "quote": true,
                "reasoning": false,
                "refine_multiturn": false,
                "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括“知识库中未找到您要的答案！”这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。",
                "tts": false,
                "use_kg": false
            },
            "prompt_type": "simple",
            "rerank_id": "",
            "similarity_threshold": 0.2,
            "status": "1",
            "tenant_id": "584524dc052911f09c67aaca66ef8756",
            "top_k": 1024,
            "top_n": 8,
            "update_date": "Wed, 26 Mar 2025 13:53:50 GMT",
            "update_time": 1742968430997,
            "vector_similarity_weight": 0.3
        },
        {
            "create_date": "Wed, 26 Mar 2025 13:51:18 GMT",
            "create_time": 1742968278031,
            "description": "A helpful dialog",
            "do_refer": "1",
            "icon": "",
            "id": "562c4a360a0611f0ae02be24a32214d8",
            "kb_ids": [],
            "kb_names": [],
            "language": "English",
            "llm_id": "forRAG_qwen2_7b___OpenAI-API@OpenAI-API-Compatible",
            "llm_setting": {
                "frequency_penalty": 0.7,
                "presence_penalty": 0.4,
                "temperature": 0.1,
                "top_p": 0.3
            },
            "name": "售后助手",
            "prompt_config": {
                "empty_response": "",
                "keyword": false,
                "parameters": [
                    {
                        "key": "knowledge",
                        "optional": false
                    }
                ],
                "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
                "quote": true,
                "reasoning": false,
                "refine_multiturn": false,
                "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括“知识库中未找到您要的答案！”这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。",
                "tts": false,
                "use_kg": false
            },
            "prompt_type": "simple",
            "rerank_id": "",
            "similarity_threshold": 0.2,
            "status": "1",
            "tenant_id": "584524dc052911f09c67aaca66ef8756",
            "top_k": 1024,
            "top_n": 8,
            "update_date": "Wed, 26 Mar 2025 13:51:18 GMT",
            "update_time": 1742968278031,
            "vector_similarity_weight": 0.3
        },
        {
            "create_date": "Wed, 26 Mar 2025 13:51:09 GMT",
            "create_time": 1742968269475,
            "description": "A helpful dialog",
            "do_refer": "1",
            "icon": "",
            "id": "5112cca00a0611f0af87be24a32214d8",
            "kb_ids": [],
            "kb_names": [],
            "language": "English",
            "llm_id": "forRAG_qwen2_7b___OpenAI-API@OpenAI-API-Compatible",
            "llm_setting": {
                "frequency_penalty": 0.7,
                "presence_penalty": 0.4,
                "temperature": 0.1,
                "top_p": 0.3
            },
            "name": "售前助手",
            "prompt_config": {
                "empty_response": "",
                "keyword": false,
                "parameters": [
                    {
                        "key": "knowledge",
                        "optional": false
                    }
                ],
                "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
                "quote": true,
                "reasoning": false,
                "refine_multiturn": false,
                "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括“知识库中未找到您要的答案！”这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。",
                "tts": false,
                "use_kg": false
            },
            "prompt_type": "simple",
            "rerank_id": "",
            "similarity_threshold": 0.2,
            "status": "1",
            "tenant_id": "584524dc052911f09c67aaca66ef8756",
            "top_k": 1024,
            "top_n": 8,
            "update_date": "Wed, 26 Mar 2025 13:51:09 GMT",
            "update_time": 1742968269475,
            "vector_similarity_weight": 0.3
        },
        {
            "create_date": "Thu, 20 Mar 2025 09:37:57 GMT",
            "create_time": 1742434677343,
            "description": "A helpful dialog",
            "do_refer": "1",
            "icon": "",
            "id": "f36100ce052b11f09288aaca66ef8756",
            "kb_ids": [],
            "kb_names": [],
            "language": "English",
            "llm_id": "forRAG_qwen2_7b___OpenAI-API@OpenAI-API-Compatible",
            "llm_setting": {
                "frequency_penalty": 0.7,
                "presence_penalty": 0.4,
                "temperature": 0.1,
                "top_p": 0.3
            },
            "name": "demo",
            "prompt_config": {
                "empty_response": "",
                "keyword": false,
                "parameters": [
                    {
                        "key": "knowledge",
                        "optional": false
                    }
                ],
                "prologue": "你好！ 我是你的助理，有什么可以帮到你的吗？",
                "quote": true,
                "reasoning": false,
                "refine_multiturn": false,
                "system": "你是一个智能助手，请总结知识库的内容来回答问题，请列举知识库中的数据详细回答。当所有知识库内容都与问题无关时，你的回答必须包括“知识库中未找到您要的答案！”这句话。回答需要考虑聊天历史。\n        以下是知识库：\n        {knowledge}\n        以上是知识库。",
                "tts": false,
                "use_kg": false
            },
            "prompt_type": "simple",
            "rerank_id": "",
            "similarity_threshold": 0.2,
            "status": "1",
            "tenant_id": "584524dc052911f09c67aaca66ef8756",
            "top_k": 1024,
            "top_n": 8,
            "update_date": "Thu, 20 Mar 2025 09:37:57 GMT",
            "update_time": 1742434677344,
            "vector_similarity_weight": 0.3
        }
    ],
    "message": "success"
}


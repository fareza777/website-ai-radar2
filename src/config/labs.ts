import type { Lab, Source } from '../lib/schema';
export const labs: Lab[] = [
  { slug: 'openai', name: 'OpenAI', tagline: 'ChatGPT · GPT · Codex', domain: 'openai.com', color: '#71d9bd', icon: 'openai' },
  { slug: 'anthropic', name: 'Anthropic', tagline: 'Claude · Claude Code', domain: 'anthropic.com', color: '#d6a48b', icon: 'anthropic' },
  { slug: 'google-deepmind', name: 'Google DeepMind', tagline: 'Gemini · Gemma · Veo', domain: 'deepmind.google', color: '#8ba9ff', icon: 'googlegemini' },
  { slug: 'xai', name: 'xAI', tagline: 'Grok · Frontier intelligence', domain: 'x.ai', color: '#dedee5', icon: 'x' },
  { slug: 'deepseek', name: 'DeepSeek', tagline: 'Reasoning · Open models', domain: 'deepseek.com', color: '#7b9bff', icon: 'deepseek' },
  { slug: 'qwen', name: 'Alibaba Qwen', tagline: 'Qwen · Multimodal · Code', domain: 'qwen.ai', color: '#b297ff', icon: 'alibabacloud' },
  { slug: 'kimi', name: 'Moonshot Kimi', tagline: 'Kimi · Long context', domain: 'moonshot.ai', color: '#94b5ff', icon: 'moonshot' },
  { slug: 'zai', name: 'Z.ai GLM', tagline: 'GLM · Open intelligence', domain: 'z.ai', color: '#b9c7ff', icon: 'zai' },
  { slug: 'meta', name: 'Meta', tagline: 'Llama · Open ecosystem', domain: 'ai.meta.com', color: '#79b5ff', icon: 'meta' },
  { slug: 'mistral', name: 'Mistral', tagline: 'Le Chat · European AI', domain: 'mistral.ai', color: '#ffa969', icon: 'mistralai' },
  { slug: 'minimax', name: 'MiniMax', tagline: 'Multimodal · Agents', domain: 'minimax.io', color: '#ff9cb5', icon: 'minimax' },
  { slug: 'cohere', name: 'Cohere', tagline: 'Command · Enterprise AI', domain: 'cohere.com', color: '#b6dac2', icon: 'cohere' },
  { slug: 'microsoft', name: 'Microsoft', tagline: 'Copilot · Azure AI · Phi', domain: 'microsoft.com', color: '#8dcbea', icon: 'microsoft' },
  { slug: 'amazon', name: 'Amazon', tagline: 'Bedrock · Nova · AWS', domain: 'aws.amazon.com', color: '#ffb975', icon: 'amazon' },
  { slug: 'baidu', name: 'Baidu', tagline: 'ERNIE · PaddlePaddle', domain: 'baidu.com', color: '#91aaff', icon: 'baidu' },
  { slug: 'tencent', name: 'Tencent', tagline: 'Hunyuan · Multimodal', domain: 'tencent.com', color: '#8dc2ff', icon: 'tencentqq' },
  { slug: 'bytedance', name: 'ByteDance', tagline: 'Doubao · Seed · Agents', domain: 'bytedance.com', color: '#8de2e3', icon: 'bytedance' },
  { slug: 'nvidia', name: 'NVIDIA', tagline: 'NIM · Nemotron · Compute', domain: 'nvidia.com', color: '#b2db6b', icon: 'nvidia' },
  { slug: 'ai21', name: 'AI21 Labs', tagline: 'Jamba · Enterprise AI', domain: 'ai21.com', color: '#c3adff', icon: 'ai21' },
  { slug: 'ibm', name: 'IBM', tagline: 'Granite · watsonx', domain: 'ibm.com', color: '#8bb5ff', icon: 'ibm' }
];
const rss = (lab: string, url: string): Source => ({ id: `${lab}-blog`, lab, kind: 'rss', url, official: true });
const github = (lab: string, repo: string): Source => ({ id: `${lab}-${repo.split('/')[1]}`, lab, kind: 'github', url: `https://api.github.com/repos/${repo}/releases?per_page=100`, official: true });
const commits = (lab: string, repo: string): Source => ({ id: `${lab}-${repo.split('/')[1]}-commits`, lab, kind: 'commits', url: `https://api.github.com/repos/${repo}/commits?per_page=100`, official: true });
export const sources: Source[] = [
  rss('openai', 'https://openai.com/news/rss.xml'), github('openai', 'openai/openai-python'), github('openai', 'openai/codex'),
  { id: 'anthropic-news', lab: 'anthropic', kind: 'html', url: 'https://www.anthropic.com/news', official: true, selector: 'a[href^="/news/"]' },
  github('anthropic', 'anthropics/claude-code'), github('anthropic', 'anthropics/anthropic-sdk-python'),
  rss('google-deepmind', 'https://deepmind.google/blog/rss.xml'), { ...rss('google-deepmind', 'https://blog.google/technology/ai/rss/'), id: 'google-ai-blog' },
  { id: 'xai-news', lab: 'xai', kind: 'html', url: 'https://x.ai/news', official: true, selector: 'a[href*="/news/"]' },
  github('deepseek', 'deepseek-ai/DeepSeek-V3'), rss('qwen', 'https://qwenlm.github.io/index.xml'), github('qwen', 'QwenLM/Qwen-Agent'),
  github('kimi', 'MoonshotAI/Kimi-K2'), github('zai', 'zai-org/GLM-4.5'), github('meta', 'meta-llama/llama-stack'),
  { id: 'mistral-news', lab: 'mistral', kind: 'html', url: 'https://mistral.ai/news', official: true, selector: 'a[href*="/news/"]' },
  github('mistral', 'mistralai/client-python'), github('minimax', 'MiniMax-AI/MiniMax-M1'),
  { id: 'cohere-news', lab: 'cohere', kind: 'html', url: 'https://cohere.com/blog', official: true, selector: 'a[href*="/blog/"]' },
  github('cohere', 'cohere-ai/cohere-python'), rss('microsoft', 'https://blogs.microsoft.com/ai/feed/'), github('microsoft', 'microsoft/autogen'),
  rss('amazon', 'https://aws.amazon.com/blogs/machine-learning/feed/'), github('baidu', 'PaddlePaddle/Paddle'),
  github('tencent', 'Tencent-Hunyuan/HunyuanVideo'), github('bytedance', 'bytedance/trae-agent'),
  rss('nvidia', 'https://blogs.nvidia.com/feed/'), github('ai21', 'AI21Labs/ai21-python'), github('ibm', 'ibm-granite/granite-io'),
  commits('deepseek', 'deepseek-ai/DeepSeek-V3'), commits('qwen', 'QwenLM/Qwen-Agent'), commits('kimi', 'MoonshotAI/Kimi-K2'),
  commits('zai', 'zai-org/GLM-4.5'), commits('minimax', 'MiniMax-AI/MiniMax-M1'), commits('microsoft', 'microsoft/autogen'),
  commits('tencent', 'Tencent-Hunyuan/HunyuanVideo'), commits('bytedance', 'bytedance/trae-agent'), commits('ai21', 'AI21Labs/ai21-python'), commits('ibm', 'ibm-granite/granite-io')
];
export const discoverySources = [
  { id: 'discover-github', name: 'GitHub', url: 'https://api.github.com/search/repositories?q=topic:artificial-intelligence+archived:false&sort=updated&order=desc&per_page=30' },
  { id: 'discover-hn', name: 'Hacker News', url: 'https://hn.algolia.com/api/v1/search_by_date?query=AI&tags=story&hitsPerPage=40' }
];
export const dealCandidates = [
  { id: 'gemini-free-tier', lab: 'google-deepmind', title: 'Gemini API · Free tier', url: 'https://ai.google.dev/gemini-api/docs/pricing', pattern: /free of charge/i, terms: 'The free tier applies only to models and quotas listed on the official page. Availability, regions, and data-use policies are subject to the official Google terms.' },
  { id: 'nvidia-developer', lab: 'nvidia', title: 'NVIDIA NIM · Developer access', url: 'https://build.nvidia.com/', pattern: /free.*(?:api|credit|access)|(?:api|credit|access).*free/i, terms: 'Evaluation access is subject to the official NVIDIA terms and may require an account. Check credit amounts, quotas, and expiry dates in the official dashboard.' },
  { id: 'mistral-experiment', lab: 'mistral', title: 'Mistral API · Experiment plan', url: 'https://docs.mistral.ai/deployment/ai-studio/tier', pattern: /experiment.*free|free.*experiment/i, terms: 'The experiment plan is free only if the current official documentation says so. Usage limits and data terms apply.' }
];

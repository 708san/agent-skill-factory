import { randomUUID } from 'node:crypto';
import { requireAuth, json, errorResponse, readJson } from '../lib/http.js';
import { config, repoForVisibility } from '../lib/config.js';
import { createBranch, putTextFile, deleteTextFile, compare, createPullRequest, listCommitsForPath, getTextFile, getRepo, getAuthenticatedUser, getRateLimit, deleteBranch, assertRefExists } from '../lib/github.js';
import { getFactoryModule, listSkills, searchSkills, getSkill, getSkillFile, validateSkillText } from '../lib/skills.js';
import { assertRegistryPath, listFlows, searchFlows, getFlow, listSuites, searchSuites, getSuite, findRegistryDependents, preflightRegistryDelete, validateFlowPackage, validateSuitePackage } from '../lib/registry.js';
import { planRegistryReferenceMigration, applyRegistryReferenceMigration } from '../lib/migration.js';
import { scanSecrets } from '../lib/security.js';
import { FactoryError, dependencyConflict, secretDetected, validationError } from '../lib/errors.js';
import { runWithRequestContext, context, logEvent } from '../lib/request-context.js';

const API_VERSION = '0.9.0';

export default {
  async fetch(request) {
    return runWithRequestContext(request, async () => {
      const started = Date.now();
      const url = new URL(request.url);
      const route = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '');
      try {
        if (route === 'healthz') return json({ ok: true, status: 'healthy' });
        if (route === 'version') return json({ ok: true, version: API_VERSION });
        requireAuth(request);
        let response;
        switch (route) {
          case 'readyz': response = await handleReadyz(); break;
          case 'diagnostics': response = await handleDiagnostics(); break;
          case 'diagnostics/write-test': response = await handleDiagnosticsWriteTest(request); break;
          case 'preflight': response = await handlePreflight(request); break;
          case 'factory-module': response = await handleFactoryModule(url); break;
          case 'factory-file': response = await handleFactoryFile(url); break;
          case 'skills': response = await handleSkills(url); break;
          case 'search-skills': response = await handleSearchSkills(url); break;
          case 'skill': response = await handleSkill(url); break;
          case 'skill-file': response = await handleSkillFile(url); break;
          case 'flows': response = await handleFlows(url); break;
          case 'search-flows': response = await handleSearchFlows(url); break;
          case 'flow': response = await handleFlow(url); break;
          case 'suites': response = await handleSuites(url); break;
          case 'search-suites': response = await handleSearchSuites(url); break;
          case 'suite': response = await handleSuite(url); break;
          case 'registry-dependents': requireGet(request); response = await handleRegistryDependents(url); break;
          case 'plan-registry-reference-migration': response = await handlePlanRegistryReferenceMigration(request); break;
          case 'apply-registry-reference-migration': response = await handleApplyRegistryReferenceMigration(request); break;
          case 'skill-history': case 'registry-history': response = await handleRegistryHistory(url); break;
          case 'create-branch': response = await handleCreateBranch(request); break;
          case 'write-files': response = await handleWriteFiles(request); break;
          case 'delete-file': response = await handleDeleteFile(request); break;
          case 'validate-skill': response = await handleValidateSkill(request); break;
          case 'validate-flow': response = await handleValidateFlow(request); break;
          case 'validate-suite': response = await handleValidateSuite(request); break;
          case 'compare': response = await handleCompare(url); break;
          case 'pull-request': response = await handlePullRequest(request); break;
          default: throw new FactoryError('FILE_NOT_FOUND', `Unknown API route: ${route}`, { status: 404, operation: 'route', stage: 'request' });
        }
        logEvent('request_complete', { route, method: request.method, status: response.status, durationMs: Date.now() - started });
        return response;
      } catch (e) {
        const response = errorResponse(e);
        logEvent('request_failed', { route, method: request.method, status: response.status, errorCode: e?.code || 'INTERNAL_ERROR', durationMs: Date.now() - started });
        return response;
      }
    });
  }
};

async function handleFactoryModule(url) { const name = url.searchParams.get('name'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, ...(await getFactoryModule(name, ref)) }); }
async function handleFactoryFile(url) { let path = url.searchParams.get('path'); const ref = url.searchParams.get('ref') || undefined; path = ({ 'api-router': 'api/[...route].js' })[path] || path; assertAllowedFactoryPath(path); const file = await getTextFile(config().factoryRepo, path, ref); return json({ ok: true, path: file.path, content: file.text, sha: file.sha, ref: ref || config().baseBranch }); }
async function handleSkills(url) { const visibility = url.searchParams.get('visibility'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, visibility, skills: await listSkills(visibility, ref) }); }
async function handleSearchSkills(url) { const query = url.searchParams.get('query'); const visibility = url.searchParams.get('visibility'); const limit = url.searchParams.get('limit') || 5; const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, query, visibility, skills: await searchSkills(query, visibility, limit, ref) }); }
async function handleSkill(url) { const visibility = url.searchParams.get('visibility'); const name = url.searchParams.get('name'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, ...(await getSkill(visibility, name, ref)) }); }
async function handleSkillFile(url) { const visibility = url.searchParams.get('visibility'); const name = url.searchParams.get('name'); const path = url.searchParams.get('path'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, ...(await getSkillFile(visibility, name, path, ref)) }); }
async function handleFlows(url) { const visibility = url.searchParams.get('visibility'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, visibility, flows: await listFlows(visibility, ref) }); }
async function handleSearchFlows(url) { const query = url.searchParams.get('query'); const visibility = url.searchParams.get('visibility'); const limit = url.searchParams.get('limit') || 5; const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, query, visibility, flows: await searchFlows(query, visibility, limit, ref) }); }
async function handleFlow(url) { const visibility = url.searchParams.get('visibility'); const name = url.searchParams.get('name'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, ...(await getFlow(visibility, name, ref)) }); }
async function handleSuites(url) { const visibility = url.searchParams.get('visibility'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, visibility, suites: await listSuites(visibility, ref) }); }
async function handleSearchSuites(url) { const query = url.searchParams.get('query'); const visibility = url.searchParams.get('visibility'); const limit = url.searchParams.get('limit') || 5; const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, query, visibility, suites: await searchSuites(query, visibility, limit, ref) }); }
async function handleSuite(url) { const visibility = url.searchParams.get('visibility'); const name = url.searchParams.get('name'); const ref = url.searchParams.get('ref') || undefined; return json({ ok: true, ...(await getSuite(visibility, name, ref)) }); }
async function handleRegistryDependents(url) { const targetType=url.searchParams.get('targetType'), targetName=url.searchParams.get('targetName'), targetVisibility=url.searchParams.get('targetVisibility'), dependentVisibility=url.searchParams.get('dependentVisibility'), ref=url.searchParams.get('ref'); const dependents=await findRegistryDependents({targetType,targetName,targetVisibility,dependentVisibility,ref}); return json({ok:true,target:{type:targetType,name:targetName,visibility:targetVisibility},scan:{visibility:dependentVisibility,ref},dependents}); }
async function handlePlanRegistryReferenceMigration(request) { requirePost(request); return json(await planRegistryReferenceMigration(await readJson(request))); }
async function handleApplyRegistryReferenceMigration(request) { requirePost(request); return json(await applyRegistryReferenceMigration(await readJson(request))); }
async function handleRegistryHistory(url) { const target=url.searchParams.get('target'), visibility=url.searchParams.get('visibility'), name=url.searchParams.get('name'); if(!name) throw validationError('name is required'); const normalizedTarget=target||'skill'; if(!['skill','flow','suite','factory'].includes(normalizedTarget)) throw validationError('target must be skill, flow, suite, or factory'); const repo=normalizedTarget==='factory'?config().factoryRepo:repoForVisibility(visibility); const basePath={skill:`skills/${name}`,flow:`flows/${name}`,suite:`suites/${name}`,factory:`factory/${name}`}[normalizedTarget]; const commits=await listCommitsForPath(repo,basePath,url.searchParams.get('ref')||undefined); return json({ok:true,commits:commits.map(c=>({sha:c.sha,message:c.commit?.message,date:c.commit?.author?.date,url:c.html_url}))}); }
async function handleCreateBranch(request) { requirePost(request); const body=await readJson(request); const repo=body.target==='factory'?config().factoryRepo:repoForVisibility(body.visibility); const branch=body.branch; const result=await createBranch(repo,branch,body.base||config().baseBranch); return json({ok:true,repository:`${config().owner}/${repo}`,branch,status:result.status}); }

async function preflightFiles(body, repo) {
  if (!body.branch) throw validationError('branch is required', { repo, operation: 'preflight', stage: 'validation' });
  if (!Array.isArray(body.files) || !body.files.length) throw validationError('files[] is required', { repo, ref: body.branch, operation: 'preflight', stage: 'validation' });
  const checks=[];
  for (const file of body.files) {
    if (!file.path || typeof file.content !== 'string') throw validationError('Each file needs path and content', { repo, ref: body.branch, operation: 'preflight', stage: 'validation' });
    assertSafePath(file.path);
    if (body.target !== 'factory') assertRegistryPath(file.path,file.content);
    const sec=scanSecrets(file.content); if(!sec.ok) throw secretDetected(`Secret-like content detected in ${file.path}`, {repo,ref:body.branch,path:file.path,operation:'preflight',stage:'secret_scan'});
    if (file.path.endsWith('/SKILL.md')) { const v=validateSkillText(file.content); if(!v.ok) throw validationError(`Invalid SKILL.md: ${file.path}`, {repo,ref:body.branch,path:file.path,operation:'preflight',stage:'skill_validation'}); }
    const flow=file.path.match(/^flows\/([^/]+)\/FLOW\.json$/); if(flow){ const v=await validateFlowPackage({visibility:body.visibility,name:flow[1],ref:body.branch,flowJson:file.content}); if(!v.ok) throw validationError(`Invalid FLOW.json: ${file.path}: ${v.errors.join('; ')}`, {repo,ref:body.branch,path:file.path,operation:'preflight',stage:'flow_validation'}); }
    const suite=file.path.match(/^suites\/([^/]+)\/SUITE\.json$/); if(suite){ const v=await validateSuitePackage({visibility:body.visibility,name:suite[1],ref:body.branch,suiteJson:file.content}); if(!v.ok) throw validationError(`Invalid SUITE.json: ${file.path}: ${v.errors.join('; ')}`, {repo,ref:body.branch,path:file.path,operation:'preflight',stage:'suite_validation'}); }
    checks.push({path:file.path,ok:true});
  }
  return checks;
}
async function handlePreflight(request) { requirePost(request); const body=await readJson(request); const repo=body.target==='factory'?config().factoryRepo:repoForVisibility(body.visibility); const files=await preflightFiles(body,repo); return json({ok:true,repository:`${config().owner}/${repo}`,branch:body.branch,files}); }
async function handleWriteFiles(request) { requirePost(request); const body=await readJson(request); const repo=body.target==='factory'?config().factoryRepo:repoForVisibility(body.visibility); await preflightFiles(body,repo); const results=[]; for(const file of body.files){ const result=await putTextFile(repo,file.path,file.content,body.branch,body.message||`Update ${file.path}`,Object.prototype.hasOwnProperty.call(file,'expectedSha')?file.expectedSha:undefined); results.push({path:file.path,status:result.status||'applied',commit:result.commit?.sha||null,contentSha:result.content?.sha||null}); } return json({ok:true,repository:`${config().owner}/${repo}`,branch:body.branch,operationId:context().operationId,files:results}); }
async function handleDeleteFile(request) { requirePost(request); const body=await readJson(request); const repo=body.target==='factory'?config().factoryRepo:repoForVisibility(body.visibility); if(!body.path||body.path.includes('..')||body.path.startsWith('/')) throw validationError('Invalid path'); if(body.target!=='factory'){ assertRegistryPath(body.path); const p=await preflightRegistryDelete({path:body.path,visibility:body.visibility,branch:body.branch,dependencyRefs:body.dependencyRefs||{}}); if(p.guarded&&!p.safe) throw dependencyConflict(p.message||p.reason,{repo,ref:body.branch,path:body.path,operation:'delete_file',stage:'dependency_preflight'}); } const result=await deleteTextFile(repo,body.path,body.branch,body.message); return json({ok:true,repository:`${config().owner}/${repo}`,path:body.path,commit:result.commit?.sha}); }
async function handleValidateSkill(request) { requirePost(request); const body=await readJson(request),structure=validateSkillText(body.skillMd||''),secrets=scanSecrets(body.skillMd||''); return json({ok:structure.ok&&secrets.ok,structure,secrets}); }
async function handleValidateFlow(request) { requirePost(request); const body=await readJson(request),structure=await validateFlowPackage({visibility:body.visibility,name:body.name,ref:body.ref,flowJson:body.flowJson}),secrets=scanSecrets(body.flowJson||''); return json({ok:structure.ok&&secrets.ok,structure,secrets}); }
async function handleValidateSuite(request) { requirePost(request); const body=await readJson(request),structure=await validateSuitePackage({visibility:body.visibility,name:body.name,ref:body.ref,suiteJson:body.suiteJson}),secrets=scanSecrets(body.suiteJson||''); return json({ok:structure.ok&&secrets.ok,structure,secrets}); }
async function handleCompare(url) { const target=url.searchParams.get('target'),visibility=url.searchParams.get('visibility'),head=url.searchParams.get('head'),base=url.searchParams.get('base')||config().baseBranch;if(!head)throw validationError('head is required');const repo=target==='factory'?config().factoryRepo:repoForVisibility(visibility),diff=await compare(repo,base,head);return json({ok:true,repository:`${config().owner}/${repo}`,base,head,status:diff.status,aheadBy:diff.ahead_by,behindBy:diff.behind_by,stale:(diff.behind_by||0)>0,totalCommits:diff.total_commits,files:(diff.files||[]).map(f=>({filename:f.filename,status:f.status,additions:f.additions,deletions:f.deletions,patch:f.patch||null}))}); }
async function handlePullRequest(request) { requirePost(request); const body=await readJson(request);const repo=body.target==='factory'?config().factoryRepo:repoForVisibility(body.visibility),base=body.base||config().baseBranch,diff=await compare(repo,base,body.head);if((diff.behind_by||0)>0&&!body.allowStale)throw dependencyConflict(`Head branch is behind ${base}; refusing PR by default`,{repo,ref:body.head,operation:'create_pull_request',stage:'stale_check'});const pr=await createPullRequest(repo,body.head,body.title,body.body,base);return json({ok:true,repository:`${config().owner}/${repo}`,number:pr.number,title:pr.title,url:pr.html_url}); }

async function diagnoseRepo(label, repo) { const result={label,repository:`${config().owner}/${repo}`,ok:false,baseRef:config().baseBranch,permissions:null}; try{const metadata=await getRepo(repo);result.permissions=metadata.permissions||null;await assertRefExists(repo,config().baseBranch);result.ok=true;}catch(e){result.error={code:e.code||'INTERNAL_ERROR',message:e.message};}return result; }
async function diagnosticsData() { let auth={ok:false};try{const u=await getAuthenticatedUser();auth={ok:true,login:u.login||null};}catch(e){auth={ok:false,error:{code:e.code||'INTERNAL_ERROR',message:e.message}};} let rateLimit=null;try{rateLimit=await getRateLimit();}catch(e){rateLimit={error:{code:e.code||'INTERNAL_ERROR',message:e.message}};} const c=config(); const repositories=await Promise.all([diagnoseRepo('factory',c.factoryRepo),diagnoseRepo('public_registry',c.publicRepo),diagnoseRepo('private_registry',c.privateRepo)]); return {ok:auth.ok&&repositories.every(r=>r.ok),version:API_VERSION,authentication:auth,baseRef:c.baseBranch,rateLimit,repositories}; }
async function handleDiagnostics() { return json(await diagnosticsData()); }
async function handleReadyz() { const body=await diagnosticsData(); return json({ok:body.ok,status:body.ok?'ready':'not_ready',checks:{authentication:body.authentication,repositories:body.repositories.map(r=>({label:r.label,ok:r.ok,error:r.error||null})),rateLimit:body.rateLimit}},body.ok?200:503); }
async function handleDiagnosticsWriteTest(request) {
  requirePost(request);
  const body=await readJson(request);
  if(body.confirm!==true) throw validationError('confirm:true is required for diagnostics write-test');
  const c=config(),repo=c.factoryRepo,branch=`diagnostics/write-test-${randomUUID()}`,path=`diagnostics/${randomUUID()}.txt`,expected=`operation=${context().operationId}\n`;
  const cleanup={file:'not_started',branch:'not_started'};
  let writeStatus=null,readBack=false,primaryError=null;
  try {
    await createBranch(repo,branch,c.baseBranch);
    const write=await putTextFile(repo,path,expected,branch,'Diagnostics write test',null);
    writeStatus=write.status||'applied';
    const file=await getTextFile(repo,path,branch);
    readBack=file.text===expected;
    await deleteTextFile(repo,path,branch,'Diagnostics cleanup');
    cleanup.file='deleted';
  } catch (e) {
    primaryError=e;
    if(cleanup.file==='not_started') cleanup.file='incomplete';
  } finally {
    try { cleanup.branch=(await deleteBranch(repo,branch)).status; }
    catch(e) { cleanup.branch=`failed:${e.code||'INTERNAL_ERROR'}`; }
    logEvent('diagnostics_write_test_cleanup',{repo,branch,path,cleanup});
  }
  if(primaryError) return json({ok:false,error:{code:primaryError.code||'INTERNAL_ERROR',message:primaryError.message},repository:`${c.owner}/${repo}`,branch,path,writeStatus,readBack,cleanup},primaryError.status||500);
  return json({ok:readBack,repository:`${c.owner}/${repo}`,branch,path,writeStatus,readBack,cleanup});
}
function requirePost(request){if(request.method!=='POST')throw validationError('POST required');} function requireGet(request){if(request.method!=='GET')throw validationError('GET required');}
function assertSafePath(path){const s=path.split('/');if(s.includes('..')||path.startsWith('/')||path.includes('\\'))throw validationError(`Invalid path: ${path}`);}
function assertAllowedFactoryPath(path){if(!path)throw validationError('path is required');assertSafePath(path);const denied=new Set(['.env','.env.local','.env.production','.env.development','.env.test','credentials.json','secrets.json']);if(denied.has(path)||path.startsWith('.env.'))throw validationError('Reading secret files is not allowed');const prefixes=['factory/','api/','lib/','gpt/','schemas/','templates/','evals/','docs/'];const roots=new Set(['README.md','package.json','vercel.json','.env.example','.gitignore']);if(!roots.has(path)&&!prefixes.some(p=>path.startsWith(p)))throw validationError('Path is outside the readable Factory source tree');}

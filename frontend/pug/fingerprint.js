// fingerprint.js
// generates values at build time

const gitRepoInfo = require('git-repo-info');

// adjust manually
major_minor_hotfix = '0.1.0';

// inherit from the build serve
build_number = process.env.BUILD_NUMBER; // if using Jenkins
//build_number = process.env.CI_CONCURRENT_ID; // if using Gitlab

if (build_number === undefined){
  console.log("WARN023: No build-number defined!");
  build_number = 0;
}

let current_date = new Date();

// the fingerprint
let fingerprint = {};

fingerprint.version = major_minor_hotfix + '.' + build_number.toString();
fingerprint.build_date = current_date.toUTCString();
//fingerprint.hostname = 'nafnaf';
//fingerprint.username = 'charlyoleg';

let gitInfo = gitRepoInfo();
//console.log(gitInfo); // investigating a bug of git-repo-info

//console.log(gitInfo.root);
if(gitInfo.root !== null){
  fingerprint.git_repo_name = gitInfo.root.replace(/^.*\//g, '');
}
fingerprint.git_branch_name = gitInfo.branch;
fingerprint.git_commit_hash = gitInfo.sha;
fingerprint.git_commit_author = gitInfo.author;
fingerprint.git_commit_date = gitInfo.authorDate;
fingerprint.git_commit_message = gitInfo.commitMessage;

// enable/disable service worker
fingerprint.with_service_worker = process.env.WITH_SERVICE_WORKER;

// printf for debug
//console.log("fingerprint info:\n", fingerprint);

// the exports
exports.fingerprint = fingerprint;


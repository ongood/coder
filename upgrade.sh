# 先将官方的代码fork一份到自己的github仓库,命名为cdr-coder
# 将仓库的代码git clone 到本地，新建一个开发分支dev，进行必要的修改和开发。
# 下面步骤是同步官方的更新到自己的修改过的代码仓库

TAG="v1.4.0"

echo -e "\n---- 添加远程代码库，本地标记为coder----"
echo -e "\n>git remote add coder git@github-ongood.com:ongood/cdr-coder.git"
git remote add coder git@github-ongood.com:ongood/cdr-coder.git

sleep 5

echo -e "\n---- 获取远程代码库main分支的代码----"
echo -e "\n>git fetch coder main"
git fetch coder main

sleep 5

echo -e "\n---- 基于获取的远程分支coder/main创建本地新分支cdr-main----"
echo -e "\n>git checkout -b cdr-main coder/main"
git checkout -b cdr-main coder/main

sleep 5

echo -e "\n---- 获取远程代码coder/main的最新更新----"
echo -e "\n>git pull coder main"
git pull coder main

sleep 5

echo -e "\n---- 合并origin/dev分支的更改----"
echo -e "\n>git merge origin/dev --allow-unrelated-histories -m $TAG"
git merge origin/dev --allow-unrelated-histories -m $TAG

sleep 5

echo -e "\n---- 合并origin/translatoin-cn分支的更改----"
echo -e "\n>git merge origin/translatoin-cn -m 中文翻译"
git merge origin/translatoin-cn --allow-unrelated-histories -m 中文翻译

sleep 5

echo -e "\n---- 切换到本地main分支----"
echo -e "\n>git checkout main"
git checkout main

sleep 5

echo -e "\n---- 合并本地cdr-main分支的更改----"
echo -e "\n>git merge cdr-main --allow-unrelated-histories -m $TAG"
git merge cdr-main --allow-unrelated-histories -m $TAG

sleep 5

echo -e "\n---- 推送到远程mian分支，-f 表示强制推送----"
echo -e "\n>git push origin main"
git push origin main

sleep 5

echo -e "\n---- 添加tag标签$TAG----"
echo -e "\n>git tag -a $TAG -m $TAG"
git tag -a $TAG -m $TAG

sleep 5

echo -e "\n---- 推送tag标签----"
echo -e "\n>git push origin --tags"
git push origin --tags

sleep 5

echo -e "\n---- 删除本地临时分支cdr-main----"
echo -e "\n>git branch -D cdr-main"
git branch -D cdr-main

sleep 5

echo -e "\n---- 本地删除失效的远程分支----"
echo -e "\n>git remote prune origin"
git remote prune origin

sleep 5

echo -e "\n---- 删除远程代码库的本地标记coder----"
echo -e "\n>git remote rm coder"
git remote rm coder

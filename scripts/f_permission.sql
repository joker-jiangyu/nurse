-- 修改所有存储过程的定义者（解决：修改数据库密码后存储过程报错问题）
update mysql.proc set DEFINER='root@%';
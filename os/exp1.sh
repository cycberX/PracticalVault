#Start Command bash exp1.sh   and ./exp1.sh


create(){ 
   echo "Creating Database "; 
   touch $db 
   heading="|| Roll no || Name || Class || Address ||"; 
   echo "$heading" >> $db; 
   echo "Database is Created Successfully"; 
} 
 
insert_data(){ 
   echo "Enter a Record of Student: "; 
   echo " Roll no: "; 
   read roll_no 
 
   if grep -i "$roll_no" $db 
   then 
       echo "Record Already Exist"; 
       insert_data 
   else 
       echo "Name: "; read name 
       echo "Class: "; read class 
       echo "Address: "; read address 
 
       record="|| $roll_no || $name || $class || $address ||"; 
       echo "Final Record\n$record" 
       echo "$record" >> $db; 
   fi 
} 
 
insert(){ 
   echo "******Insert New Record*******"; 
   echo "How many record you want to insert in database: "; 
   read count 
 
   i=0 
   while [ $i -lt $count ]; 
   do 
       insert_data 
       i=$((i+1)) 
   done 
} 
 
search(){ 
   echo "********Search Student Record*******"; 
   echo "Enter Roll_no of student you want to search: "; 
   read search_roll 
 
   if grep -i "$search_roll" "$db" 
   then 
       echo "Record Found"; 
   else 
       echo "Record Not Found. Please Enter Valid Roll_no "; 
       search 
   fi 
} 
 
delete(){ 
   echo "********Delete Student Record*******"; 
   echo "Enter id of student you want to delete "; 
   read id 
 
   if grep -i "$id" "$db" 
   then 
       echo "Record you are deleting s follows"; 
       sed -i "/$id/d" "$db" 
       echo "Record is Deleted"; 
   else 
       echo "id doesn't match. Please enter valid id "; 
   fi 
} 
 
display(){ 
   echo "******Display Student Record**********"; 
   cat $db 
   echo "**************************************"; 
} 
 
modify(){ 
   echo "********Modify Student Record******"; 
   echo "Enter roll_no fo student you want to modify: "; 
   read modify_roll 
 
   old_data=$(grep -i "$modify_roll" "$db"); 
 
   if grep -i "$modify_roll" "$db" 
   then 
       echo "Enter old value you want to modify: "; 
       read old_value 
 
       echo "Enter new value you want to update: "; 
       read new_value 
 
       sed -i "s/$old_value/$new_value/g" $db 
       echo "Record is Modified Successfully....."; 
   else 
       echo "Record Not Found"; 
   fi 
} 
 
menu="1) CREATE DATABASE 
2) INSERT RECORD 
3) SEARCH RECORD 
4) DELETE RECORD 
5) DISPLAY RECORD 
6) MODIFY RECORD 
7) EXIT" 
 
db=student_database 
 
echo "Welcome to Student Database"; 
 
while(true);do 
   echo ""; 
   echo "********* Main Menu ********"; 
   echo "$menu"; 
   echo "Enter a Choice no- "; 
   read ch 
 
   case $ch in 
       1) create ;; 
       2) insert ;; 
       3) search ;; 
       4) delete ;; 
       5) display ;; 
       6) modify ;; 
       7) echo "Thank You! Exiting... "; exit ;; 
       *) echo "Please Enter Valid Number of Choice" 
   esac 
done 
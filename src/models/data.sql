create database taxi;

create table users(
    user_id bigint primary key,
    username varchar(50), 
    steep varchar(500),
    is_driver boolean default false,
    is_passager boolean default false,
    phone varchar(15),
    created_at timestamp with time zone default current_timestamp
);


create table city(  
    city_id serial primary key,
    city_name varchar(100)
);

create table district(
    district_id serial,
    city_id int references city(city_id),
    district_name varchar(50)
);

create table orders(
    order_id serial,
    roole varchar(20),
    price varchar(10),
    count smallint default 4,
    status varchar(20) default 'pending',
    user_id bigint,
    from_city varchar(50),    
    to_city varchar(50), 
    from_district varchar(50),
    to_district varchar(50),   
    time smallint,
    date smallint,
    fulltime boolean default true,
    phone varchar(15),
    gender smallint,
    created_at timestamp with time zone default current_timestamp
);

insert into users (user_id,steep) values 
(887528138, 'home');

insert into city (city_name) values 
('Toshkent'),
('Andijon'),
('Namangan'),
('Farg`ona');

insert into district (city_id, district_name) values 
(1, 'Bektemir'),
(1, 'Olmazor'),
(1, 'Mirzo Ulug`bek'),
(1, 'Mirobod'),
(1, 'Yunusobod'),
(1, 'Yashnabod'),
(1, 'Yakkasaroy'),
(1, 'Uchtepa'),
(1, 'Sergili'),
(1, 'Chilonzor'),
(1, 'Shayxontohur');

insert into district (city_id, district_name) values 
(2, 'Honabod'),
(2, 'Oltin ko`l'),
(2, 'Andijon'),
(2, 'Asaka'),
(2, 'Baliqchi'),
(2, 'Bo`ston'),
(2, 'Buloqboshi'),
(2, 'Jalaquduq'),
(2, 'Izboskan'),
(2, 'Qo`rg`on tepa'),
(2, 'Marhamat'),
(2, 'Paxtabod'),
(2, 'Ulug`nor'),
(2, 'Xo`jaobod'),
(2, 'Shaxrixon');

insert into district (city_id, district_name) values 
(3, 'Davlatobod'),
(3, 'Kosonsoy'),
(3, 'Mingbuloq'),
(3, 'Namangan'),
(3, 'Norin'),
(3, 'Pop'),
(3, 'To`raqorg`on'),
(3, 'Uychi'),
(3, 'Uchqo`rg`on'),
(3, 'Chortoq'),
(3, 'Chust'),
(3, 'Yangi qorg`on');

insert into district (city_id, district_name) values 
(4, 'Bog`dod'),
(4, 'Beshariq'),
(4, 'Buvayda'),
(4, 'Dang`ara'),
(4, 'Farg`ona'),
(4, 'Furqat'),
(4, 'Oltiariq'),
(4, 'O`zbekiston'),
(4, 'Qo`shtepa'),
(4, 'Quva'),
(4, 'Rishton'),
(4, 'So`x'),
(4, 'Toshloq'),
(4, 'Uchko`prik'),
(4, 'Yozyovon');

update users 
set steep = , username = 'sarvar'
where user_id = 887528138;

select 
    c1.city_name as from_city,
    c.city_name as to_city,
    d1.district_name as from_district,
    d.district_name as to_district,
    o.time,
    o.date,
    o.phone
from orders as o
left join city as c on o.to_city = c.city_id
left join city as c1 on o.from_city = c1.city_id
left join district as d on o.to_district = d.district_id 
left join district as d1 on o.from_district = d1.district_id
where o.user_id = 1228852253
group by o.user_id, c.city_name, c1.city_name, d.district_name, d1.district_name, o.time, o.date, o.phone;

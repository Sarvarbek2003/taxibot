create database taxi;

create table users(
    user_id bigint primary key,
    username varchar(50), 
    steep varchar(500),
    is_driver boolean default false,
    is_passager boolean default false,
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
(1, 'Chilonzor'),
(1, 'Olmozor'),
(1, 'Mirzo Ulug`bek'),
(1, 'Yakkasaroy'),
(1, 'Yashnabot'),
(1, 'Uchtepa'),
(2, 'Xo`jaobod'),
(2, 'Andijon'),
(2, 'Asaka'),
(2, 'Honabod'),
(2, 'Jalaquduq'),
(2, 'Buloqboshi'),
(2, 'Baliqchi');


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

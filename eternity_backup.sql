--
-- PostgreSQL database dump
--

\restrict b1Rs3y5CYtxWTkOfHIbaKrvD7WuaB8lZ8iCUsXuSVa1eWkfWvQpb3Omal9nzhJv

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: BalanceLogType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BalanceLogType" AS ENUM (
    'CREDIT',
    'DEBIT'
);


ALTER TYPE public."BalanceLogType" OWNER TO postgres;

--
-- Name: BalanceTradingResource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BalanceTradingResource" AS ENUM (
    'IDR',
    'USD',
    'ETERNITES',
    'RAW',
    'CRAFT',
    'MAP'
);


ALTER TYPE public."BalanceTradingResource" OWNER TO postgres;

--
-- Name: GameStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GameStatus" AS ENUM (
    'PENDING',
    'PAUSED',
    'RUNNING',
    'FINISHED'
);


ALTER TYPE public."GameStatus" OWNER TO postgres;

--
-- Name: RallyPeriodStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RallyPeriodStatus" AS ENUM (
    'NOT_STARTED',
    'ON_GOING',
    'ENDED',
    'PAUSED'
);


ALTER TYPE public."RallyPeriodStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'PARTICIPANT',
    'SUPER',
    'TALKSHOW',
    'SELL',
    'BUYRAW',
    'CRAFT',
    'MAP',
    'BLACKMARKET',
    'PITCHINGGUARD',
    'PITCHING',
    'CURRENCY',
    'THUNT',
    'EXCHANGE',
    'UPGRADE',
    'POSTGUARD',
    'MONSTER',
    'PRESSURE',
    'NEWS'
);


ALTER TYPE public."Role" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: BalanceTradingLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BalanceTradingLog" (
    id text NOT NULL,
    "tradingDataId" text NOT NULL,
    amount bigint NOT NULL,
    message text NOT NULL,
    type public."BalanceLogType" NOT NULL,
    resource public."BalanceTradingResource" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BalanceTradingLog" OWNER TO postgres;

--
-- Name: CraftItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CraftItem" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."CraftItem" OWNER TO postgres;

--
-- Name: CraftPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CraftPeriod" (
    id text NOT NULL,
    "craftId" text NOT NULL,
    periode integer NOT NULL,
    price bigint NOT NULL
);


ALTER TABLE public."CraftPeriod" OWNER TO postgres;

--
-- Name: CraftRecipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CraftRecipe" (
    id text NOT NULL,
    "craftItemId" text NOT NULL,
    "rawItemId" text NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public."CraftRecipe" OWNER TO postgres;

--
-- Name: CraftStockPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CraftStockPeriod" (
    id text NOT NULL,
    "craftId" text NOT NULL,
    stock integer NOT NULL,
    periode integer NOT NULL,
    price bigint NOT NULL
);


ALTER TABLE public."CraftStockPeriod" OWNER TO postgres;

--
-- Name: CraftUserAmount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CraftUserAmount" (
    id text NOT NULL,
    "tradingDataId" text NOT NULL,
    "craftItemId" text NOT NULL,
    amount bigint NOT NULL
);


ALTER TABLE public."CraftUserAmount" OWNER TO postgres;

--
-- Name: MapRecipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MapRecipe" (
    id text NOT NULL
);


ALTER TABLE public."MapRecipe" OWNER TO postgres;

--
-- Name: MapRecipeComponent; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MapRecipeComponent" (
    id text NOT NULL,
    amount integer NOT NULL,
    "mapRecipeId" text NOT NULL,
    "craftItemId" text NOT NULL
);


ALTER TABLE public."MapRecipeComponent" OWNER TO postgres;

--
-- Name: MasterTrading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MasterTrading" (
    id text NOT NULL,
    current_periode integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."MasterTrading" OWNER TO postgres;

--
-- Name: PeriodeTrading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PeriodeTrading" (
    id text NOT NULL,
    periode integer NOT NULL,
    cost_map bigint NOT NULL,
    price_map bigint NOT NULL,
    duration integer NOT NULL,
    "endTime" timestamp(3) without time zone,
    "pausedTime" timestamp(3) without time zone,
    "startTime" timestamp(3) without time zone,
    status public."RallyPeriodStatus" DEFAULT 'NOT_STARTED'::public."RallyPeriodStatus" NOT NULL,
    "totalPausedDuration" integer DEFAULT 0 NOT NULL,
    usdidr_rate bigint NOT NULL,
    news text NOT NULL
);


ALTER TABLE public."PeriodeTrading" OWNER TO postgres;

--
-- Name: RallyActivityLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyActivityLog" (
    id text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public."RallyActivityLog" OWNER TO postgres;

--
-- Name: RallyBigItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyBigItem" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."RallyBigItem" OWNER TO postgres;

--
-- Name: RallyBigItemRecipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyBigItemRecipe" (
    id text NOT NULL,
    result_item_id text NOT NULL,
    small_item_id text NOT NULL,
    quantity integer NOT NULL
);


ALTER TABLE public."RallyBigItemRecipe" OWNER TO postgres;

--
-- Name: RallyData; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyData" (
    id text NOT NULL,
    point integer DEFAULT 0 NOT NULL,
    vault integer DEFAULT 0 NOT NULL,
    ticket integer DEFAULT 0 NOT NULL,
    access_card_level integer DEFAULT 0 NOT NULL,
    enonix integer DEFAULT 0 NOT NULL,
    minus_point integer DEFAULT 0 NOT NULL,
    special_ticket integer DEFAULT 0 NOT NULL,
    user_id text NOT NULL,
    level_upgrade_cost_id integer DEFAULT 1 NOT NULL,
    pos_visited_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RallyData" OWNER TO postgres;

--
-- Name: RallyMaster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyMaster" (
    id text NOT NULL,
    current_period_id text NOT NULL,
    special_ticket_stock integer DEFAULT 5 NOT NULL,
    total_period integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."RallyMaster" OWNER TO postgres;

--
-- Name: RallyPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyPeriod" (
    id text NOT NULL,
    name text NOT NULL,
    duration integer NOT NULL,
    status public."RallyPeriodStatus" DEFAULT 'NOT_STARTED'::public."RallyPeriodStatus" NOT NULL,
    "endTime" timestamp(3) without time zone,
    "pausedTime" timestamp(3) without time zone,
    "startTime" timestamp(3) without time zone,
    "totalPausedDuration" integer DEFAULT 0 NOT NULL,
    special_ticket_name text NOT NULL,
    special_ticket_stock integer DEFAULT 5 NOT NULL
);


ALTER TABLE public."RallyPeriod" OWNER TO postgres;

--
-- Name: RallyPos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyPos" (
    id text NOT NULL,
    period_id text NOT NULL,
    zone_id text NOT NULL,
    eonix_cost integer DEFAULT 0 NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."RallyPos" OWNER TO postgres;

--
-- Name: RallySmallItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallySmallItem" (
    id text NOT NULL,
    name text NOT NULL,
    price integer DEFAULT 5 NOT NULL,
    show_in_inventory boolean DEFAULT true NOT NULL
);


ALTER TABLE public."RallySmallItem" OWNER TO postgres;

--
-- Name: RallyZone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RallyZone" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."RallyZone" OWNER TO postgres;

--
-- Name: RawItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RawItem" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."RawItem" OWNER TO postgres;

--
-- Name: RawPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RawPeriod" (
    id text NOT NULL,
    "rawId" text NOT NULL,
    periode integer NOT NULL,
    price bigint NOT NULL
);


ALTER TABLE public."RawPeriod" OWNER TO postgres;

--
-- Name: RawStockPeriod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RawStockPeriod" (
    id text NOT NULL,
    "rawId" text NOT NULL,
    stock integer NOT NULL,
    periode integer NOT NULL,
    price bigint NOT NULL
);


ALTER TABLE public."RawStockPeriod" OWNER TO postgres;

--
-- Name: RawUserAmount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."RawUserAmount" (
    id text NOT NULL,
    "tradingDataId" text NOT NULL,
    "rawItemId" text NOT NULL,
    amount bigint NOT NULL
);


ALTER TABLE public."RawUserAmount" OWNER TO postgres;

--
-- Name: TradingData; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TradingData" (
    id text NOT NULL,
    "userId" text NOT NULL,
    idr bigint DEFAULT '-10000000000'::bigint NOT NULL,
    usd bigint DEFAULT 0 NOT NULL,
    eternites integer DEFAULT 10000 NOT NULL,
    map integer DEFAULT 0 NOT NULL,
    point integer DEFAULT 0 NOT NULL,
    "isPlayedThunt" boolean DEFAULT false NOT NULL,
    "itemFromThunt" integer DEFAULT 0 NOT NULL,
    "hadPitching" boolean DEFAULT false NOT NULL,
    "finalIDR" text
);


ALTER TABLE public."TradingData" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'PARTICIPANT'::public."Role" NOT NULL,
    "talkshowPoints" integer DEFAULT 0 NOT NULL,
    "totalPoints" numeric(65,30) DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserBigItemInventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserBigItemInventory" (
    id text NOT NULL,
    user_id text NOT NULL,
    big_item_id text NOT NULL,
    amount integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."UserBigItemInventory" OWNER TO postgres;

--
-- Name: UserSmallItemInventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserSmallItemInventory" (
    id text NOT NULL,
    user_id text NOT NULL,
    small_item_id text NOT NULL,
    amount integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."UserSmallItemInventory" OWNER TO postgres;

--
-- Name: _RallyBigItemToRallySmallItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_RallyBigItemToRallySmallItem" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_RallyBigItemToRallySmallItem" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: access_card_upgrade_cost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.access_card_upgrade_cost (
    id integer NOT NULL,
    eonix_cost integer NOT NULL,
    big_item_id text,
    small_item_id text,
    big_item_amount_required integer DEFAULT 0 NOT NULL,
    small_item_amount_required integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.access_card_upgrade_cost OWNER TO postgres;

--
-- Name: access_card_upgrade_cost_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.access_card_upgrade_cost_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.access_card_upgrade_cost_id_seq OWNER TO postgres;

--
-- Name: access_card_upgrade_cost_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.access_card_upgrade_cost_id_seq OWNED BY public.access_card_upgrade_cost.id;


--
-- Name: access_card_upgrade_cost id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_card_upgrade_cost ALTER COLUMN id SET DEFAULT nextval('public.access_card_upgrade_cost_id_seq'::regclass);


--
-- Data for Name: BalanceTradingLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BalanceTradingLog" (id, "tradingDataId", amount, message, type, resource, "createdAt") FROM stdin;
cmllwfq7t0001qv0189gpafes	cmllu03le0077nw267n1s0mb6	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:51:50.393
cmllwfrhv0003qv01ge23qhac	cmllu0l6u008vnw26jnnl3z1k	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:51:52.05
cmllwfyb50005qv01dw3j0oto	cmllu0j14008nnw269ihx0pxl	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:52:00.882
cmllwg2px0007qv01lm97qulm	cmllu0ep90087nw26uyzbvykl	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 05:52:06.594
cmllwg5300009qv01cg9g5ewf	cmllu07os007nnw2657lw1mt3	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:52:09.661
cmllwgxpb000bqv0140aby7b4	cmllu0jsw008pnw26umu3i0fj	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 05:52:46.751
cmllwhiy5000dqv01sjmdn0y1	cmllu0bdv0081nw26gpystvor	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 05:53:14.285
cmllwhxu0000fqv01rfq33357	cmlltzwvk006dnw261evs8qz0	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 05:53:33.576
cmllwi7eo000hqv016sjlc6t8	cmllu01fk0071nw26rgvf2gft	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:53:45.983
cmllwi9bw000nqv01dds2uxb8	cmlltzw6n0069nw266t9ghu5c	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:53:48.476
cmllwi9bx000pqv018y7o8oc7	cmlltzw6n0069nw266t9ghu5c	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 05:53:48.478
cmllwifid000vqv0146sivpfh	cmlltzyqo006nnw26bdi47ek8	6500	Bulk Purchase: 30x Wood, 10x Metal. (Items Cost: 6500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:53:56.485
cmllwifkw000xqv01ljixbfpn	cmlltzyqo006nnw26bdi47ek8	40	Acquired: 30x Wood, 10x Metal	CREDIT	RAW	2026-02-14 05:53:56.577
cmllwip5c0013qv01sneaatb2	cmllu00w3006znw26zc4y9ek0	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:54:08.976
cmllwip5f0015qv01iex1dal1	cmllu00w3006znw26zc4y9ek0	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 05:54:08.979
cmllwj77g001bqv01yqlhx9sx	cmllu06wy007jnw26xy0x6dn5	3000	Bulk Purchase: 10x Wood, 8x Coal. (Items Cost: 3000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:54:32.38
cmllwj7a6001dqv01vpu98e9a	cmllu06wy007jnw26xy0x6dn5	18	Acquired: 10x Wood, 8x Coal	CREDIT	RAW	2026-02-14 05:54:32.478
cmllwj94u001jqv0187d05j3v	cmlltzxsz006hnw267qcl5gqp	7500	Bulk Purchase: 45x Wood, 15x Water. (Items Cost: 7500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:54:34.879
cmllwj94v001lqv01xtmnnv1u	cmlltzxsz006hnw267qcl5gqp	60	Acquired: 45x Wood, 15x Water	CREDIT	RAW	2026-02-14 05:54:34.88
cmllwjblv001pqv01t7qpof04	cmllu07dj007lnw261urdgi6e	1000	Bulk Purchase: 10x Wood. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:54:38.084
cmllwjblx001rqv01xw5j6545	cmllu07dj007lnw261urdgi6e	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 05:54:38.085
cmllwjmpu001tqv01d9hyqtue	cmlltzzt8006tnw26kuftz5q9	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:54:52.482
cmllwjpq9001xqv01mqydyj0h	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 05:54:56.385
cmllwjpst001zqv0154rga0tg	cmllu00w3006znw26zc4y9ek0	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 05:54:56.477
cmllwjpsv0021qv0116kg5mrw	cmllu00w3006znw26zc4y9ek0	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 05:54:56.48
cmllwjpvl0023qv015h999t8r	cmllu00w3006znw26zc4y9ek0	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 05:54:56.578
cmllwjr48002bqv01ltlkktau	cmllu0gh8008dnw26sfpjylw0	3750	Bulk Purchase: 10x Wood, 2x Glass, 5x Metal. (Items Cost: 3750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:54:58.184
cmllwjr49002dqv01f840rsvi	cmllu0gh8008dnw26sfpjylw0	17	Acquired: 10x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 05:54:58.185
cmllwk0j2002jqv01nrn6a3gt	cmllu095j007vnw26ikcqk5fx	1600	Bulk Purchase: 3x Water, 4x Coal. (Items Cost: 1600 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:55:10.382
cmllwk0lp002lqv01lwnzewp9	cmllu095j007vnw26ikcqk5fx	7	Acquired: 3x Water, 4x Coal	CREDIT	RAW	2026-02-14 05:55:10.477
cmllwkabp002nqv01fmf6c4og	cmlltzw6n0069nw266t9ghu5c	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:55:23.077
cmllwkabr002pqv01heqlk7rm	cmlltzw6n0069nw266t9ghu5c	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 05:55:23.08
cmllwkg430031qv01uy360tlu	cmllu0dry0085nw26fee82749	6000	Bulk Purchase: 5x Wood, 1x Glass, 10x Water, 5x Coal, 5x Metal. (Items Cost: 6000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:55:30.579
cmllwkg440033qv01hpbnjlgd	cmllu0dry0085nw26fee82749	26	Acquired: 5x Wood, 1x Glass, 10x Water, 5x Coal, 5x Metal	CREDIT	RAW	2026-02-14 05:55:30.581
cmllwkq810035qv0150rnm9nt	cmlltzvq60067nw26qemjfwxj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:55:43.68
cmllwkqzt0039qv01c9gapece	cmlltzxsz006hnw267qcl5gqp	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 05:55:44.682
cmllwkqzv003bqv01eet293sm	cmlltzxsz006hnw267qcl5gqp	3	Bulk Crafted: 3x Brown Paper	CREDIT	CRAFT	2026-02-14 05:55:44.683
cmllwkqzv003dqv01tggyfj02	cmlltzxsz006hnw267qcl5gqp	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 05:55:44.684
cmllwkqzw003fqv01ronxoiaz	cmlltzxsz006hnw267qcl5gqp	15	Consumed 15x Water for crafting	DEBIT	RAW	2026-02-14 05:55:44.685
cmllwkt8h003lqv01eyp12gfc	cmllu09jj007xnw26irsp7nwv	5500	Bulk Purchase: 45x Wood, 2x Glass. (Items Cost: 5500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:55:47.585
cmllwkt8i003nqv017zot4o2i	cmllu09jj007xnw26irsp7nwv	47	Acquired: 45x Wood, 2x Glass	CREDIT	RAW	2026-02-14 05:55:47.586
cmllwkxh1003pqv013fu9bdcn	cmllu05wr007fnw263pcca89z	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 05:55:53.077
cmllwlh5o003rqv01jtme33m4	cmllu07os007nnw2657lw1mt3	1800	Thunt reward: 1800 Eternities	CREDIT	ETERNITES	2026-02-14 05:56:18.588
cmllwll08003tqv01bq1ouvpt	cmllu0j14008nnw269ihx0pxl	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 05:56:23.576
cmllwllh3003zqv017ezlnu5h	cmlltzz1o006pnw26ztynyxv4	1500	Bulk Purchase: 10x Wood, 1x Glass. (Items Cost: 1500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:56:24.183
cmllwllh60041qv01h8xlj0rg	cmlltzz1o006pnw26ztynyxv4	11	Acquired: 10x Wood, 1x Glass	CREDIT	RAW	2026-02-14 05:56:24.186
cmllwllux0047qv01zurh3v6l	cmllu02a60073nw26f5vv4wcw	1100	Bulk Purchase: 1x Wood, 2x Glass. (Items Cost: 1100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:56:24.681
cmllwlluy0049qv01r7f6b71s	cmllu02a60073nw26f5vv4wcw	3	Acquired: 1x Wood, 2x Glass	CREDIT	RAW	2026-02-14 05:56:24.682
cmllwlp3o004dqv01tv4efbe6	cmllu0gh8008dnw26sfpjylw0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 05:56:28.884
cmllwlp3p004fqv01sefg14sv	cmllu0gh8008dnw26sfpjylw0	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 05:56:28.885
cmllwlp3q004hqv01wgrgeb4s	cmllu0gh8008dnw26sfpjylw0	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 05:56:28.886
cmllwlp66004jqv016beg3i6l	cmllu0gh8008dnw26sfpjylw0	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 05:56:28.974
cmllwlp68004lqv01iija2nk6	cmllu0gh8008dnw26sfpjylw0	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 05:56:28.976
cmllwlqya004tqv01vq5s3zjp	cmllu0i3k008jnw26vfsdew9m	3750	Bulk Purchase: 10x Wood, 2x Glass, 5x Metal. (Items Cost: 3750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:56:31.282
cmllwlqyb004vqv01jzw766h0	cmllu0i3k008jnw26vfsdew9m	17	Acquired: 10x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 05:56:31.283
cmllwm0o5004zqv01vyp8ph0m	cmllu0kvl008tnw26fe8h34vp	2000	Bulk Purchase: 20x Wood. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:56:43.877
cmllwm0o70051qv01fhqnzba1	cmllu0kvl008tnw26fe8h34vp	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 05:56:43.88
cmllwm0u40053qv011yuwzlp1	cmlltzzi0006rnw2673ipn4ol	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:56:44.092
cmllwm3xm0055qv01f0fatg5x	cmllu0i3k008jnw26vfsdew9m	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:56:48.106
cmllwm83p0057qv01n5dgrkrn	cmllu08or007tnw26wd6mv6wd	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:56:53.51
cmllwmdvd005dqv016d1kao5j	cmllu0mw10093nw26ppcub6u6	1700	Bulk Purchase: 7x Wood, 4x Coal. (Items Cost: 1700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:57:00.986
cmllwmdxw005fqv01b02r39e5	cmllu0mw10093nw26ppcub6u6	11	Acquired: 7x Wood, 4x Coal	CREDIT	RAW	2026-02-14 05:57:01.077
cmllwmf6m005hqv01hm42uv1w	cmllu0ik5008lnw26o95uvsly	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:57:02.687
cmllwmlqk005pqv01264wz9sx	cmllu0hmt008hnw26efktlnfg	7000	Bulk Purchase: 15x Wood, 15x Water, 10x Coal. (Items Cost: 7000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:57:11.18
cmllwmlw4005rqv01967vap2b	cmllu0hmt008hnw26efktlnfg	40	Acquired: 15x Wood, 15x Water, 10x Coal	CREDIT	RAW	2026-02-14 05:57:11.381
cmllwmplh005tqv012z6x61nt	cmllu03le0077nw267n1s0mb6	200	Thunt reward: 200 Eternities	CREDIT	ETERNITES	2026-02-14 05:57:16.181
cmllwmqln005vqv01n2jx7fq4	cmllu044s0079nw26frbt1r2i	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 05:57:17.484
cmllwn61a005xqv01wv3e6dqm	cmllu0gh8008dnw26sfpjylw0	4025	Sold 1x Magnifying Glass for 4025 Eternites	CREDIT	CRAFT	2026-02-14 05:57:37.486
cmllwn73x0063qv01hr9nyug9	cmllu082g007pnw26i9kqife7	6000	Bulk Purchase: 30x Wood, 15x Water. (Items Cost: 6000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:57:38.878
cmllwn7410065qv01meiea8m0	cmllu082g007pnw26i9kqife7	45	Acquired: 30x Wood, 15x Water	CREDIT	RAW	2026-02-14 05:57:38.882
cmllwnm040067qv016cjun1dp	cmllu07os007nnw2657lw1mt3	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:57:58.179
cmllwnqxz006bqv01y8ac1trn	cmllu0l6u008vnw26jnnl3z1k	3500	Bulk Purchase: 35x Wood. (Items Cost: 3500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:58:04.583
cmllwnrek006dqv0100kzb4sk	cmllu0l6u008vnw26jnnl3z1k	35	Acquired: 35x Wood	CREDIT	RAW	2026-02-14 05:58:05.18
cmllwnrh8006fqv01xw7lkqcn	cmllu08dp007rnw26v4dgmp23	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:58:05.275
cmllwob01006pqv01x05zvdqb	cmlltzyhy006lnw26tbnvyy6x	3250	Bulk Purchase: 7x Wood, 5x Water, 2x Coal, 3x Metal. (Items Cost: 3250 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:58:30.578
cmllwob04006rqv01w2ci9pcp	cmlltzyhy006lnw26tbnvyy6x	17	Acquired: 7x Wood, 5x Water, 2x Coal, 3x Metal	CREDIT	RAW	2026-02-14 05:58:30.581
cmllwods8006vqv01beqx7exy	cmlltzy4f006jnw264h8kyavc	6500	Bulk Purchase: 65x Wood. (Items Cost: 6500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:58:34.185
cmllwodxl006xqv01y945hx2e	cmlltzy4f006jnw264h8kyavc	65	Acquired: 65x Wood	CREDIT	RAW	2026-02-14 05:58:34.378
cmllworfw006zqv017aw3ylnr	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:58:51.883
cmllwowop0071qv01p44dgnuz	cmllu0dry0085nw26fee82749	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:58:58.68
cmllwp0rt0079qv0142j45bjp	cmllu01fk0071nw26rgvf2gft	8000	Bulk Purchase: 20x Wood, 10x Coal, 10x Metal. (Items Cost: 8000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:59:03.977
cmllwp0ru007bqv017yzpubmn	cmllu01fk0071nw26rgvf2gft	40	Acquired: 20x Wood, 10x Coal, 10x Metal	CREDIT	RAW	2026-02-14 05:59:03.979
cmllwp38p007dqv01g8t5aaad	cmllu06j7007hnw26uw0sp36v	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 05:59:07.175
cmllwp5hb007jqv01kd43l8ff	cmllu00kw006xnw261mwscl7e	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:59:10.08
cmllwp5hc007lqv01hj7k37lr	cmllu00kw006xnw261mwscl7e	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 05:59:10.08
cmllwptv4007nqv01huumn5x9	cmllu082g007pnw26i9kqife7	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 05:59:41.68
cmllwpw6c007vqv01ujtrprjf	cmllu05ad007dnw26h2vqc9kh	3750	Bulk Purchase: 10x Wood, 2x Glass, 5x Metal. (Items Cost: 3750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 05:59:44.676
cmllwpw6d007xqv017ap8t0uk	cmllu05ad007dnw26h2vqc9kh	17	Acquired: 10x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 05:59:44.678
cmllwq11h007zqv01s0rf7wzm	cmllu0j14008nnw269ihx0pxl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 05:59:50.98
cmllwqh5x0081qv01cf8zjdpp	cmlltzwho006bnw2675cqbryr	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:00:11.875
cmllwqikx0083qv011b2d9r67	cmllu0ofe0099nw26n7luunss	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:00:13.713
cmllwqpt40085qv01j6kmo9dj	cmllu0gh8008dnw26sfpjylw0	3750	Bulk Purchase: 10x Wood, 2x Glass, 5x Metal. (Items Cost: 3750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:00:23.081
cmllwqpt50087qv010w9e65m7	cmllu0gh8008dnw26sfpjylw0	17	Acquired: 10x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 06:00:23.082
cmllwr34z0089qv014e37lrgu	cmlltzz1o006pnw26ztynyxv4	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:00:40.356
cmllwrc9a008bqv011ixnhz4c	cmllu095j007vnw26ikcqk5fx	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:00:52.174
cmllwrcsv008fqv013uo208v3	cmllu03le0077nw267n1s0mb6	2500	Bulk Purchase: 25x Wood. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:00:52.88
cmllwrcsw008hqv016n05021h	cmllu03le0077nw267n1s0mb6	25	Acquired: 25x Wood	CREDIT	RAW	2026-02-14 06:00:52.88
cmllwrk4u008lqv01bvltyglm	cmllu0gh8008dnw26sfpjylw0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:01:02.382
cmllwrk50008nqv01enf1qngq	cmllu0gh8008dnw26sfpjylw0	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:01:02.388
cmllwrk7e008pqv01onqrq4j2	cmllu0gh8008dnw26sfpjylw0	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:01:02.474
cmllwrk7f008rqv01kybxn1ht	cmllu0gh8008dnw26sfpjylw0	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:01:02.475
cmllwrk7g008tqv014vf8abjn	cmllu0gh8008dnw26sfpjylw0	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:01:02.477
cmllwru14008vqv01qj8sctdh	cmlltzy4f006jnw264h8kyavc	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:01:15.208
cmllws1ey0093qv01jq5s8a3p	cmllu0fek0089nw26lw6emt67	5400	Bulk Purchase: 10x Wood, 7x Water, 12x Coal. (Items Cost: 5400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:01:24.778
cmllws1hn0095qv01zowxuaik	cmllu0fek0089nw26lw6emt67	29	Acquired: 10x Wood, 7x Water, 12x Coal	CREDIT	RAW	2026-02-14 06:01:24.875
cmllws3hy0099qv01nh3rz7mp	cmlltzzt8006tnw26kuftz5q9	9300	Bulk Purchase: 93x Wood. (Items Cost: 9300 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:01:27.478
cmllws3kq009bqv01bjqhh8ug	cmlltzzt8006tnw26kuftz5q9	93	Acquired: 93x Wood	CREDIT	RAW	2026-02-14 06:01:27.578
cmllws4qa009dqv01aobg7mml	cmllu0jsw008pnw26umu3i0fj	41200000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:01:29.074
cmllwse5d009fqv01kuvygcyi	cmllu0bdv0081nw26gpystvor	29600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:01:41.281
cmllwsosn009jqv01zxvicy17	cmllu08dp007rnw26v4dgmp23	1500	Bulk Purchase: 15x Wood. (Items Cost: 1500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:01:55.079
cmllwsovc009lqv019e964ehp	cmllu08dp007rnw26v4dgmp23	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 06:01:55.176
cmllwsuky009pqv014xre8wnn	cmllu07dj007lnw261urdgi6e	3000	Bulk Purchase: 20x Wood, 5x Water. (Items Cost: 3000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:02:02.578
cmllwsuno009rqv018j03qmg9	cmllu07dj007lnw261urdgi6e	25	Acquired: 20x Wood, 5x Water	CREDIT	RAW	2026-02-14 06:02:02.677
cmllwsvky009vqv01qey0f240	cmllu0mw10093nw26ppcub6u6	1000	Bulk Purchase: 5x Water. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:02:03.875
cmllwsvqk009xqv013qd0xhuc	cmllu0mw10093nw26ppcub6u6	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 06:02:04.076
cmllwswcu009zqv01037tvcrh	cmllu0bxd0083nw26cle9wtdh	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:02:04.878
cmllwt02500a3qv019f0sj900	cmllu07os007nnw2657lw1mt3	10000	Bulk Purchase: 100x Wood. (Items Cost: 10000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:02:09.678
cmllwt04y00a5qv01nknvnqls	cmllu07os007nnw2657lw1mt3	100	Acquired: 100x Wood	CREDIT	RAW	2026-02-14 06:02:09.778
cmllwt38300a7qv01t0y3bct3	cmllu0ep90087nw26uyzbvykl	4100	Pitching Reward (USD)	CREDIT	USD	2026-02-14 06:02:13.778
cmllwtk4d00adqv01k2wdsrly	cmlltzw6n0069nw266t9ghu5c	2500	Bulk Purchase: 3x Coal, 5x Metal. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:02:35.677
cmllwtk4e00afqv01uww2aaho	cmlltzw6n0069nw266t9ghu5c	8	Acquired: 3x Coal, 5x Metal	CREDIT	RAW	2026-02-14 06:02:35.678
cmllwtoz800ajqv01kzk6mhcw	cmllu00w3006znw26zc4y9ek0	2400	Bulk Purchase: 7x Water, 4x Coal. (Items Cost: 2400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:02:41.972
cmllwtozb00alqv01bp9ypji6	cmllu00w3006znw26zc4y9ek0	11	Acquired: 7x Water, 4x Coal	CREDIT	RAW	2026-02-14 06:02:41.975
cmllwtqty00anqv0130hw8hab	cmllu00kw006xnw261mwscl7e	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:02:44.283
cmllwui2p00atqv01xp0tbhe4	cmlltzvq60067nw26qemjfwxj	9500	Bulk Purchase: 95x Wood. (Items Cost: 9500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:03:19.681
cmllwui2q00avqv019jk3odez	cmlltzvq60067nw26qemjfwxj	95	Acquired: 95x Wood	CREDIT	RAW	2026-02-14 06:03:19.683
cmllwum8p00b1qv01ocqeyn8l	cmlltzzi0006rnw2673ipn4ol	6500	Bulk Purchase: 30x Wood, 10x Metal. (Items Cost: 6500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:03:25.082
cmllwum8q00b3qv01e7o69vlf	cmlltzzi0006rnw2673ipn4ol	40	Acquired: 30x Wood, 10x Metal	CREDIT	RAW	2026-02-14 06:03:25.082
cmllwup3e00b7qv01jsrx62wy	cmlltzwho006bnw2675cqbryr	2000	Bulk Purchase: 20x Wood. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:03:28.779
cmllwup6600b9qv01bwix0ehy	cmlltzwho006bnw2675cqbryr	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 06:03:28.878
cmllwuqib00bbqv017sbvuzl9	cmllu0ik5008lnw26o95uvsly	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 06:03:30.611
cmllwuthr00bfqv018r9rixig	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:03:34.48
cmllwutki00bhqv01pocaywqo	cmllu00w3006znw26zc4y9ek0	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 06:03:34.579
cmllwutnc00bjqv01fqxcykab	cmllu00w3006znw26zc4y9ek0	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 06:03:34.681
cmllwutng00blqv017rahius4	cmllu00w3006znw26zc4y9ek0	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 06:03:34.685
cmllwuzz300bnqv01wb9cpgdi	cmllu044s0079nw26frbt1r2i	1800	Thunt reward: 1800 Eternities	CREDIT	ETERNITES	2026-02-14 06:03:42.879
cmllwv53u00bpqv01gwazqcc8	cmllu08or007tnw26wd6mv6wd	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 06:03:49.53
cmllwvc3200btqv012hlnqc0d	cmllu02a60073nw26f5vv4wcw	2650	Bulk Purchase: 9x Wood, 5x Metal. (Items Cost: 2650 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:03:58.574
cmllwvc3400bvqv01cuw6of8a	cmllu02a60073nw26f5vv4wcw	14	Acquired: 9x Wood, 5x Metal	CREDIT	RAW	2026-02-14 06:03:58.577
cmllwvhsq00bxqv01nap0pucq	cmlltzwvk006dnw261evs8qz0	3500000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 06:04:05.978
cmllww2xu00c1qv01ck0zr4o0	cmllu0j14008nnw269ihx0pxl	9000	Bulk Purchase: 90x Wood. (Items Cost: 9000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:04:33.378
cmllww2xv00c3qv015kaixg30	cmllu0j14008nnw269ihx0pxl	90	Acquired: 90x Wood	CREDIT	RAW	2026-02-14 06:04:33.38
cmllwwir500c7qv017aip6rcb	cmllu0h0u008fnw2603crdwbl	6000	Bulk Purchase: 60x Wood. (Items Cost: 6000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:04:53.873
cmllwwir700c9qv01oslmub5f	cmllu0h0u008fnw2603crdwbl	60	Acquired: 60x Wood	CREDIT	RAW	2026-02-14 06:04:53.875
cmllwwt9600cdqv011ktcj0gr	cmllu004r006vnw263zlbwtzm	1000	Bulk Purchase: 10x Wood. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:05:07.483
cmllwwt9700cfqv010zu3r6h4	cmllu004r006vnw263zlbwtzm	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 06:05:07.483
cmllwx4wf00cjqv01u4ppn6xo	cmllu05ad007dnw26h2vqc9kh	250	Bulk Purchase: 1x Coal. (Items Cost: 250 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:05:22.575
cmllwx4wg00clqv01b0hbnjwq	cmllu05ad007dnw26h2vqc9kh	1	Acquired: 1x Coal	CREDIT	RAW	2026-02-14 06:05:22.577
cmllwx98200cpqv0182aff0y1	cmlltzyqo006nnw26bdi47ek8	2500	Bulk Purchase: 15x Wood, 2x Glass. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:05:28.179
cmllwx98400crqv01kikqnyyh	cmlltzyqo006nnw26bdi47ek8	17	Acquired: 15x Wood, 2x Glass	CREDIT	RAW	2026-02-14 06:05:28.18
cmllwxjvr00cxqv019xhel0ss	cmllu0bxd0083nw26cle9wtdh	5000	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:05:41.988
cmllwxjvt00czqv01d5d0ftds	cmllu0bxd0083nw26cle9wtdh	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:05:41.988
cmllwxtwo00d5qv018dii901k	cmllu0ofe0099nw26n7luunss	4000	Bulk Purchase: 15x Wood, 10x Coal. (Items Cost: 4000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:05:54.985
cmllwxtz700d7qv01mnw23lve	cmllu0ofe0099nw26n7luunss	25	Acquired: 15x Wood, 10x Coal	CREDIT	RAW	2026-02-14 06:05:55.075
cmllwy4bj00dbqv01vjx6bdxt	cmllu02a60073nw26f5vv4wcw	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:06:08.48
cmllwy4bn00ddqv01hru4pztx	cmllu02a60073nw26f5vv4wcw	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:06:08.483
cmllwy4bo00dfqv01d5ezbiu9	cmllu02a60073nw26f5vv4wcw	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:06:08.484
cmllwy4bp00dhqv01oi91ev0h	cmllu02a60073nw26f5vv4wcw	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:06:08.485
cmllwy4ea00djqv01i72aeg2l	cmllu02a60073nw26f5vv4wcw	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:06:08.579
cmllwyj4w00dlqv0125hb3jjj	cmllu0dry0085nw26fee82749	2500	Bulk Purchase: 25x Wood. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:06:27.681
cmllwyjac00dnqv018glglu0e	cmllu0dry0085nw26fee82749	25	Acquired: 25x Wood	CREDIT	RAW	2026-02-14 06:06:27.877
cmllwyz1400dtqv01frbfec0n	cmlltzyhy006lnw26tbnvyy6x	2300	Bulk Purchase: 8x Wood, 5x Water, 2x Coal. (Items Cost: 2300 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:06:48.281
cmllwyz1500dvqv01jm4wg1dq	cmlltzyhy006lnw26tbnvyy6x	15	Acquired: 8x Wood, 5x Water, 2x Coal	CREDIT	RAW	2026-02-14 06:06:48.282
cmllwz4a100dzqv01dft78g2w	cmlltzy4f006jnw264h8kyavc	2000	Bulk Purchase: 4x Glass. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:06:55.081
cmllwz4a300e1qv01vvc87jq8	cmlltzy4f006jnw264h8kyavc	4	Acquired: 4x Glass	CREDIT	RAW	2026-02-14 06:06:55.083
cmllwzkbw00e7qv0118rl6bza	cmllu0mw10093nw26ppcub6u6	4000	Bulk Purchase: 20x Wood, 5x Water, 4x Coal. (Items Cost: 4000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:07:15.884
cmllwzkef00e9qv019q71iku6	cmllu0mw10093nw26ppcub6u6	29	Acquired: 20x Wood, 5x Water, 4x Coal	CREDIT	RAW	2026-02-14 06:07:15.975
cmllwzl0t00ebqv01q7x1knd9	cmllu082g007pnw26i9kqife7	26800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:07:16.781
cmllwzqhw00edqv01ncnvnjns	cmllu06wy007jnw26xy0x6dn5	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:07:23.876
cmllx00lp00enqv01bjif9kna	cmllu04r7007bnw26zxtj1wy7	5000	Bulk Purchase: 30x Wood, 10x Water. (Items Cost: 5000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:07:36.973
cmllx00lr00epqv01lgsv68ft	cmllu04r7007bnw26zxtj1wy7	40	Acquired: 30x Wood, 10x Water	CREDIT	RAW	2026-02-14 06:07:36.975
cmllx060700evqv01frdz1wvg	cmllu03le0077nw267n1s0mb6	7400	Bulk Purchase: 5x Wood, 4x Glass, 14x Metal. (Items Cost: 7400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:07:43.975
cmllx060800exqv01mv7lop2a	cmllu03le0077nw267n1s0mb6	23	Acquired: 5x Wood, 4x Glass, 14x Metal	CREDIT	RAW	2026-02-14 06:07:43.977
cmllx0fnr00ezqv01mpk69h5e	cmllu004r006vnw263zlbwtzm	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 06:07:56.487
cmllx0qzp00f9qv01p60jkkzt	cmllu02z70075nw267utb00t1	400	Bulk Purchase: 2x Water. (Items Cost: 400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:08:11.086
cmllx0qzt00fbqv017c2zu8bm	cmllu02z70075nw267utb00t1	2	Acquired: 2x Water	CREDIT	RAW	2026-02-14 06:08:11.176
cmllx0rzz00ffqv01r8qzm24a	cmllu0ik5008lnw26o95uvsly	1000	Bulk Purchase: 2x Glass. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:08:12.479
cmllx0s0300fhqv01wnov33m0	cmllu0ik5008lnw26o95uvsly	2	Acquired: 2x Glass	CREDIT	RAW	2026-02-14 06:08:12.483
cmllx0zk500fjqv01mwmhtndp	cmllu05wr007fnw263pcca89z	54400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:08:22.277
cmllx12vr00fpqv011ju6woas	cmllu0bdv0081nw26gpystvor	4250	Bulk Purchase: 25x Wood, 5x Metal. (Items Cost: 4250 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:08:26.583
cmllx12vs00frqv01n2tf95er	cmllu0bdv0081nw26gpystvor	30	Acquired: 25x Wood, 5x Metal	CREDIT	RAW	2026-02-14 06:08:26.585
cmllx1ewt00fxqv014g4wsaae	cmllu044s0079nw26frbt1r2i	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:08:42.174
cmllx1ezu00fzqv01uyyignyt	cmllu044s0079nw26frbt1r2i	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 06:08:42.278
cmllx1phh00g1qv014cini177	cmllu0ofe0099nw26n7luunss	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:08:55.878
cmllx2del00g7qv0178vev5gh	cmllu0hmt008hnw26efktlnfg	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:09:26.877
cmlm1cypi01j9qo01r065qiod	cmllu0fek0089nw26lw6emt67	5460	Bulk Purchase: 52x Wood. (Items Cost: 5460 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:09:39.51
cmlm1cypj01jbqo01q3mg2fm4	cmllu0fek0089nw26lw6emt67	52	Acquired: 52x Wood	CREDIT	RAW	2026-02-14 08:09:39.511
cmlm1db7b01jdqo01kcrsebc0	cmlltzxsz006hnw267qcl5gqp	1050	Bulk Purchase: 10x Wood. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:09:55.701
cmlm1db7f01jfqo01pcrsubre	cmlltzxsz006hnw267qcl5gqp	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:09:55.708
cmlm1dvf601jjqo01gdi2tsij	cmlltzxsz006hnw267qcl5gqp	720	Bulk Purchase: 2x Metal. (Items Cost: 720 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:10:21.906
cmlm1dvf701jlqo01d2cf6gfc	cmlltzxsz006hnw267qcl5gqp	2	Acquired: 2x Metal	CREDIT	RAW	2026-02-14 08:10:21.907
cmlm1ebpc01jnqo01rbclg788	cmllu01fk0071nw26rgvf2gft	1080	Bulk Purchase: 3x Metal. (Items Cost: 1080 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:10:43.008
cmlm1ebpd01jpqo013dd0tu53	cmllu01fk0071nw26rgvf2gft	3	Acquired: 3x Metal	CREDIT	RAW	2026-02-14 08:10:43.009
cmlm1esg701jtqo01l1zg0a15	cmllu0h0u008fnw2603crdwbl	3600	Bulk Purchase: 10x Metal. (Items Cost: 3600 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:11:04.711
cmlm1esg801jvqo01zr7q0b5m	cmllu0h0u008fnw2603crdwbl	10	Acquired: 10x Metal	CREDIT	RAW	2026-02-14 08:11:04.712
cmlm1f76k01jxqo0147d3ws1g	cmllu0h0u008fnw2603crdwbl	360	Bulk Purchase: 1x Metal. (Items Cost: 360 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:11:23.804
cmlm1f76p01jzqo01zkkotii9	cmllu0h0u008fnw2603crdwbl	1	Acquired: 1x Metal	CREDIT	RAW	2026-02-14 08:11:23.809
cmlm25l3q01ybqo01da19cn3s	cmllu04r7007bnw26zxtj1wy7	350	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:31:54.902
cmlm25l3q01ydqo01dqt5ive9	cmllu04r7007bnw26zxtj1wy7	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:31:54.902
cmlm27a4z01ylqo01unefeb64	cmlltzwho006bnw2675cqbryr	2550	Sold 1x Brown Paper for 2550 Eternites	CREDIT	CRAFT	2026-02-14 08:33:13.91
cmllx2g6p00gdqv01n2b8obhf	cmllu08or007tnw26wd6mv6wd	2000	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:09:30.481
cmllx2g9f00gfqv0118prtzhl	cmllu08or007tnw26wd6mv6wd	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 06:09:30.579
cmllx2mlc00ghqv01sgflvnkm	cmllu06wy007jnw26xy0x6dn5	540	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 06:09:38.784
cmllx2mlc00gjqv01663hjmr5	cmllu06wy007jnw26xy0x6dn5	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 06:09:38.784
cmllx2xxe00gnqv01lfzr3sps	cmllu06wy007jnw26xy0x6dn5	1100	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:09:53.474
cmllx2xxe00gpqv01wpx2iy0a	cmllu06wy007jnw26xy0x6dn5	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:09:53.474
cmllx3d4n00gxqv0152yu83lu	cmllu0jsw008pnw26umu3i0fj	3850	Bulk Purchase: 15x Wood, 8x Water, 3x Coal. (Items Cost: 3850 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:10:13.175
cmllx3d4p00gzqv01aw8jyuh5	cmllu0jsw008pnw26umu3i0fj	26	Acquired: 15x Wood, 8x Water, 3x Coal	CREDIT	RAW	2026-02-14 06:10:13.178
cmllx3vc800h3qv017vqwgeas	cmllu04r7007bnw26zxtj1wy7	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:10:36.777
cmllx3vne00h5qv010e9t9mp8	cmllu04r7007bnw26zxtj1wy7	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 06:10:37.179
cmllx3wf400h7qv01qmpvypom	cmllu04r7007bnw26zxtj1wy7	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 06:10:38.176
cmllx3wi200h9qv01hhtjr2cq	cmllu04r7007bnw26zxtj1wy7	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 06:10:38.282
cmllx4epp00hbqv013hhjdx9a	cmllu03le0077nw267n1s0mb6	1400	Sold 4x Metal for 1400 Eternites	CREDIT	RAW	2026-02-14 06:11:01.886
cmllx4ql900hfqv01mx1givvu	cmllu08or007tnw26wd6mv6wd	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:11:17.277
cmllx4qla00hhqv01849hivn9	cmllu08or007tnw26wd6mv6wd	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 06:11:17.279
cmllx4qlb00hjqv01otdx22y8	cmllu08or007tnw26wd6mv6wd	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:11:17.28
cmllx4qlc00hlqv01is1j6doq	cmllu08or007tnw26wd6mv6wd	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 06:11:17.281
cmllx57n900hpqv0136ndjel3	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:11:39.382
cmllx57na00hrqv01ksphvx95	cmllu03le0077nw267n1s0mb6	2	Bulk Crafted: 2x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:11:39.383
cmllx57ne00htqv01h2k3khav	cmllu03le0077nw267n1s0mb6	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 06:11:39.386
cmllx57q400hvqv01x6z0lphf	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 06:11:39.484
cmllx57ss00hxqv01h6j66dfc	cmllu03le0077nw267n1s0mb6	4	Consumed 4x Glass for crafting	DEBIT	RAW	2026-02-14 06:11:39.581
cmllx5nun00hzqv01td03dsgq	cmllu0hmt008hnw26efktlnfg	4250	Sold 3 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 06:12:00.382
cmllx5nun00i1qv01re2ah4ev	cmllu0hmt008hnw26efktlnfg	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 06:12:00.382
cmllx5zyq00i5qv013wu7i09g	cmllu0l6u008vnw26jnnl3z1k	5000	Bulk Purchase: 20x Coal. (Items Cost: 5000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:12:16.082
cmllx5zyr00i7qv01mfkdqmkc	cmllu0l6u008vnw26jnnl3z1k	20	Acquired: 20x Coal	CREDIT	RAW	2026-02-14 06:12:16.083
cmllx6jkb00ibqv01tw2r4ce7	cmllu0ep90087nw26uyzbvykl	500	Bulk Purchase: 1x Glass. (Items Cost: 500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:12:41.483
cmllx6jkb00idqv0123zbksof	cmllu0ep90087nw26uyzbvykl	1	Acquired: 1x Glass	CREDIT	RAW	2026-02-14 06:12:41.484
cmllx6sl700ihqv01cocbobwc	cmlltzzi0006rnw2673ipn4ol	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:12:53.18
cmllx6sl900ijqv010965y4pp	cmlltzzi0006rnw2673ipn4ol	2	Bulk Crafted: 2x Dividers	CREDIT	CRAFT	2026-02-14 06:12:53.181
cmllx6sla00ilqv015s5grvgh	cmlltzzi0006rnw2673ipn4ol	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 06:12:53.183
cmllx6snu00inqv01pribxqus	cmlltzzi0006rnw2673ipn4ol	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 06:12:53.274
cmllx6zdp00irqv01fgxfup4p	cmlltzw6n0069nw266t9ghu5c	2250	Bulk Purchase: 2x Glass, 5x Coal. (Items Cost: 2250 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:13:01.981
cmllx6zgl00itqv018s25x88a	cmlltzw6n0069nw266t9ghu5c	7	Acquired: 2x Glass, 5x Coal	CREDIT	RAW	2026-02-14 06:13:02.085
cmllx7a4e00ivqv01rvpbrbhe	cmllu095j007vnw26ikcqk5fx	17200000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:13:15.902
cmllx7yn400izqv01bb3ss0ow	cmllu0hmt008hnw26efktlnfg	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:13:47.681
cmllx7yn700j1qv01h5jhi1od	cmllu0hmt008hnw26efktlnfg	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 06:13:47.683
cmllx7ypp00j3qv01ikv48ji9	cmllu0hmt008hnw26efktlnfg	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:13:47.684
cmllx7yps00j5qv019r5zrzve	cmllu0hmt008hnw26efktlnfg	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 06:13:47.777
cmllx7zn600j7qv016qra9vux	cmllu0ik5008lnw26o95uvsly	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:13:48.978
cmllx8gjk00j9qv01zi0r78bv	cmllu06j7007hnw26uw0sp36v	36400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:14:10.88
cmllx9olk00jbqv01r7563xvd	cmllu08or007tnw26wd6mv6wd	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:15:07.975
cmllxaaz700jdqv01k2zza5gn	cmlltzyhy006lnw26tbnvyy6x	1450	Bulk Purchase: 5x Wood, 1x Water, 3x Coal. (Items Cost: 1450 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:15:36.98
cmllxaaz800jfqv014sxnw9od	cmlltzyhy006lnw26tbnvyy6x	9	Acquired: 5x Wood, 1x Water, 3x Coal	CREDIT	RAW	2026-02-14 06:15:36.981
cmllxamh800jjqv0146ks76fr	cmlltzzi0006rnw2673ipn4ol	2500	Bulk Purchase: 10x Coal. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:15:51.885
cmllxamjs00jlqv01p0hdvzxe	cmlltzzi0006rnw2673ipn4ol	10	Acquired: 10x Coal	CREDIT	RAW	2026-02-14 06:15:51.976
cmllxb25300jnqv01sfzstyid	cmlltzwho006bnw2675cqbryr	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:16:12.183
cmllxb75f00jpqv01ij0a8ey8	cmllu03le0077nw267n1s0mb6	4025	Sold 1x Magnifying Glass for 4025 Eternites	CREDIT	CRAFT	2026-02-14 06:16:18.675
cmllxcm3000jrqv01ltfinp1r	cmllu004r006vnw263zlbwtzm	3400000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 06:17:24.684
cmllxcry300jvqv01knoho7ol	cmllu02z70075nw267utb00t1	500	Bulk Purchase: 2x Coal. (Items Cost: 500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:17:32.283
cmllxcry400jxqv01a8jphq4n	cmllu02z70075nw267utb00t1	2	Acquired: 2x Coal	CREDIT	RAW	2026-02-14 06:17:32.284
cmllxczfi00jzqv01l4q88w5l	cmlltzy4f006jnw264h8kyavc	500	Sold 1x Glass for 500 Eternites	CREDIT	RAW	2026-02-14 06:17:41.982
cmllxdik600k5qv01gcnyc92t	cmllu05wr007fnw263pcca89z	1000	Bulk Purchase: 5x Wood, 1x Glass. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:18:06.775
cmllxdik800k7qv0155zal030	cmllu05wr007fnw263pcca89z	6	Acquired: 5x Wood, 1x Glass	CREDIT	RAW	2026-02-14 06:18:06.777
cmllxegtn00k9qv014xd0nr4c	cmllu03le0077nw267n1s0mb6	3750	Bulk Purchase: 10x Wood, 2x Glass, 5x Metal. (Items Cost: 3750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:18:51.179
cmllxegtq00kbqv01ntz0pjup	cmllu03le0077nw267n1s0mb6	17	Acquired: 10x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 06:18:51.183
cmllxet8w00kdqv01j1ajrtx8	cmllu082g007pnw26i9kqife7	200	Sold 1x Water for 200 Eternites	CREDIT	RAW	2026-02-14 06:19:07.28
cmllxeubr00kfqv0101mxji7u	cmllu06wy007jnw26xy0x6dn5	500	Bulk Purchase: 2x Coal. (Items Cost: 500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:19:08.679
cmllxeubu00khqv01gcql6kss	cmllu06wy007jnw26xy0x6dn5	2	Acquired: 2x Coal	CREDIT	RAW	2026-02-14 06:19:08.682
cmllxfejo00kjqv01qllqv5xc	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:19:34.884
cmllxfemb00klqv01p4yqrk06	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:19:34.98
cmllxfeme00knqv016hvwuwzu	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:19:34.982
cmllxfeoz00kpqv01m07ii76u	cmllu03le0077nw267n1s0mb6	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:19:35.076
cmllxfep100krqv01zm9z7ptq	cmllu03le0077nw267n1s0mb6	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:19:35.077
cmllxfp6x00ktqv017loo8eu2	cmllu03le0077nw267n1s0mb6	8050	Sold 2x Magnifying Glass for 8050 Eternites	CREDIT	CRAFT	2026-02-14 06:19:48.68
cmllxgcyh00kvqv01kkwyk0sc	cmllu02a60073nw26f5vv4wcw	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:20:19.48
cmllxguxo00kxqv01ghl5zunx	cmllu0mw10093nw26ppcub6u6	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:20:42.778
cmllxgwv500kzqv01cw62c52f	cmllu00kw006xnw261mwscl7e	34000000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:20:45.282
cmllxh67b00l3qv01yokambyu	cmllu06wy007jnw26xy0x6dn5	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:20:57.383
cmllxh6cs00l5qv017rzv87gc	cmllu06wy007jnw26xy0x6dn5	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 06:20:57.58
cmllxh6cu00l7qv012m3ce1wb	cmllu0bdv0081nw26gpystvor	6800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:20:57.582
cmllxh6fm00l9qv01q6iujpk5	cmllu06wy007jnw26xy0x6dn5	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:20:57.682
cmllxh6fr00lbqv01j5vuzgyw	cmllu06wy007jnw26xy0x6dn5	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 06:20:57.688
cmllxh7o100ldqv01jwlzldq8	cmlltzzt8006tnw26kuftz5q9	10230	Sold 93x Wood for 10230 Eternites	CREDIT	RAW	2026-02-14 06:20:59.281
cmllxhrez00lfqv01s9y0crem	cmllu0dry0085nw26fee82749	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:21:24.875
cmllxhwz200lhqv01xpy5f0nr	cmlltzvq60067nw26qemjfwxj	10450	Sold 95x Wood for 10450 Eternites	CREDIT	RAW	2026-02-14 06:21:32.078
cmllxhx4q00ljqv01t77ndh1l	cmllu0h0u008fnw2603crdwbl	2750	Sold 25x Wood for 2750 Eternites	CREDIT	RAW	2026-02-14 06:21:32.282
cmllxhxa800llqv014dmgn2nv	cmlltzyqo006nnw26bdi47ek8	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:21:32.48
cmllxi08f00lnqv01azs7n2lk	cmllu05ad007dnw26h2vqc9kh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:21:36.303
cmllxi72x00lpqv01yvszxbud	cmllu08dp007rnw26v4dgmp23	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:21:45.177
cmllxikyv00lrqv01h6vqcp2i	cmllu004r006vnw263zlbwtzm	1100	Sold 10x Wood for 1100 Eternites	CREDIT	RAW	2026-02-14 06:22:03.174
cmllxiv2r00ltqv01j0x9ggea	cmllu095j007vnw26ikcqk5fx	1125	Bulk Purchase: 4x Water, 1x Coal. (Items Cost: 1125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:22:16.275
cmllxiv2t00lvqv01bpykvx7k	cmllu095j007vnw26ikcqk5fx	5	Acquired: 4x Water, 1x Coal	CREDIT	RAW	2026-02-14 06:22:16.277
cmllxj79n00lxqv01p90tg56d	cmlltzzi0006rnw2673ipn4ol	2650	Sold 10x Coal for 2650 Eternites	CREDIT	RAW	2026-02-14 06:22:31.981
cmllxjb1u00lzqv01e1jy7b4q	cmllu00kw006xnw261mwscl7e	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:22:36.978
cmllxjdai00m1qv011v41ru4d	cmlltzzi0006rnw2673ipn4ol	7800	Sold 2x Dividers for 7800 Eternites	CREDIT	CRAFT	2026-02-14 06:22:39.881
cmllxjhom00m3qv018uostrx2	cmllu0hmt008hnw26efktlnfg	2175	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2175 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:22:45.574
cmllxjhoo00m5qv019a2a4t88	cmllu0hmt008hnw26efktlnfg	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 06:22:45.576
cmllxjjv500m7qv01mjtt111d	cmllu0bdv0081nw26gpystvor	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:22:48.401
cmllxk72k00m9qv01ws3g21sw	cmlltzz1o006pnw26ztynyxv4	29200000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:23:18.476
cmllxk92t00mbqv01yjyed7nm	cmllu0jsw008pnw26umu3i0fj	4800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:23:21.077
cmllxke9100mdqv01zfyk8big	cmlltzy4f006jnw264h8kyavc	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:23:27.678
cmllxknl700mfqv014oa4ef6g	cmllu0hmt008hnw26efktlnfg	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:23:39.883
cmllxknny00mhqv01uv0x6s9f	cmllu0hmt008hnw26efktlnfg	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 06:23:39.982
cmllxknta00mjqv01cpu9yl3t	cmllu0hmt008hnw26efktlnfg	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:23:40.082
cmllxknw100mlqv01tg2i2ner	cmllu0hmt008hnw26efktlnfg	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 06:23:40.274
cmllxkrg200mnqv01p6jn0o82	cmllu07os007nnw2657lw1mt3	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:23:44.881
cmllxla1h00mpqv01br2hl6e8	cmllu0j14008nnw269ihx0pxl	9900	Sold 90x Wood for 9900 Eternites	CREDIT	RAW	2026-02-14 06:24:08.977
cmllxlrpn00mrqv01qwjax0g8	cmlltzyhy006lnw26tbnvyy6x	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:24:31.882
cmllxm4wj00mtqv01dtwlo30m	cmllu03le0077nw267n1s0mb6	3525	Bulk Purchase: 15x Wood, 5x Metal. (Items Cost: 3525 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:24:48.979
cmllxm4wl00mvqv01hde5n9ac	cmllu03le0077nw267n1s0mb6	20	Acquired: 15x Wood, 5x Metal	CREDIT	RAW	2026-02-14 06:24:48.981
cmllxnr8h0001qo01yngygg1n	cmllu05wr007fnw263pcca89z	530	Sold 1x Glass for 530 Eternites	CREDIT	RAW	2026-02-14 06:26:04.486
cmllxny0x0005qo01roxyc2fb	cmllu02z70075nw267utb00t1	860	Bulk Purchase: 3x Wood, 2x Coal. (Items Cost: 860 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:26:13.377
cmllxny6l0007qo01i2hffsj9	cmllu02z70075nw267utb00t1	5	Acquired: 3x Wood, 2x Coal	CREDIT	RAW	2026-02-14 06:26:13.581
cmllxoaiw0009qo01zj7npqb7	cmllu0hmt008hnw26efktlnfg	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:26:29.575
cmllxox25000bqo01c4ut06ut	cmllu0dry0085nw26fee82749	2200	Thunt reward: 2200 Eternities	CREDIT	ETERNITES	2026-02-14 06:26:58.78
cmllxpdq0000dqo01qx8ly1pb	cmlltzxsz006hnw267qcl5gqp	550	Sold 5x Wood for 550 Eternites	CREDIT	RAW	2026-02-14 06:27:20.375
cmllxpdq0000fqo016qrqpdle	cmlltzxsz006hnw267qcl5gqp	2400	Sold 1x Brown Paper for 2400 Eternites	CREDIT	CRAFT	2026-02-14 06:27:20.375
cmllxphfe000hqo01pigoqh3k	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:27:25.089
cmllxppzn000jqo015hnufvtk	cmlltzyqo006nnw26bdi47ek8	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 06:27:36.274
cmllxptgq000nqo01qduz50go	cmllu0mw10093nw26ppcub6u6	2645	Bulk Purchase: 10x Wood, 3x Coal, 2x Metal. (Items Cost: 2645 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:27:40.778
cmllxptjh000pqo01iryga4ia	cmllu0mw10093nw26ppcub6u6	15	Acquired: 10x Wood, 3x Coal, 2x Metal	CREDIT	RAW	2026-02-14 06:27:40.877
cmllxqatq000rqo01mx59cevz	cmllu08dp007rnw26v4dgmp23	1000	Thunt reward: 1000 Eternities	CREDIT	ETERNITES	2026-02-14 06:28:03.276
cmllxqyo5000tqo01yroza83d	cmlltzy4f006jnw264h8kyavc	1590	Sold 3x Glass for 1590 Eternites	CREDIT	RAW	2026-02-14 06:28:34.18
cmllxrnz7000zqo01hugm9z8d	cmllu07os007nnw2657lw1mt3	5500	Sold 50x Wood for 5500 Eternites	CREDIT	RAW	2026-02-14 06:29:06.976
cmllxs1k60015qo019ko8gz4h	cmllu0l6u008vnw26jnnl3z1k	1100	Sold 10x Wood for 1100 Eternites	CREDIT	RAW	2026-02-14 06:29:24.579
cmllxs1k70017qo01oyu01rab	cmllu0l6u008vnw26jnnl3z1k	1060	Sold 4x Coal for 1060 Eternites	CREDIT	RAW	2026-02-14 06:29:24.579
cmlm1g6oe01k1qo0159u717ub	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:12:09.805
cmlm1gfjv01k3qo01z4u86g22	cmllu0dry0085nw26fee82749	4400000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 08:12:21.307
cmlm1gmvm01k5qo01zcpe3904	cmllu02a60073nw26f5vv4wcw	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:12:30.803
cmlm1h1m801k9qo01ochqpelm	cmlltzyhy006lnw26tbnvyy6x	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:12:49.904
cmlm1h76d01kjqo0123hosxig	cmllu0dry0085nw26fee82749	-4400000	Converted 4400000 USD to IDR	DEBIT	USD	2026-02-14 08:12:57.106
cmlm1h76e01klqo0195ragyev	cmllu0dry0085nw26fee82749	78069200000	Received 78069200000 IDR from USD	CREDIT	IDR	2026-02-14 08:12:57.106
cmlm1hdhh01knqo01jbk5cp2p	cmllu095j007vnw26ikcqk5fx	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:13:05.285
cmlm26xbu01yfqo01hcz45h8u	cmlltzzt8006tnw26kuftz5q9	3800000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 08:32:57.402
cmlm27kpf01ynqo01cwgbd54f	cmllu004r006vnw263zlbwtzm	2200	Thunt reward: 2200 Eternities	CREDIT	ETERNITES	2026-02-14 08:33:27.607
cmlm285b901yxqo01551lc3h9	cmllu082g007pnw26i9kqife7	1800	Thunt reward: 1800 Eternities	CREDIT	ETERNITES	2026-02-14 08:33:54.31
cmlm29mjr01zfqo01gglu14d0	cmlltzzi0006rnw2673ipn4ol	43600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:35:03.21
cmlm29r9901zlqo013d1nusvf	cmllu00w3006znw26zc4y9ek0	4700	Bulk Purchase: 20x Wood, 10x Water. (Items Cost: 4700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:35:09.501
cmlm29r9a01znqo01fotq7y8x	cmllu00w3006znw26zc4y9ek0	30	Acquired: 20x Wood, 10x Water	CREDIT	RAW	2026-02-14 08:35:09.502
cmlm29t6v01zpqo01vaw8mcho	cmllu02z70075nw267utb00t1	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:35:12.006
cmlm2a8mc01zxqo01a7j66jy2	cmlltzy4f006jnw264h8kyavc	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:35:32.004
cmllxrd3i000vqo01n5usy48c	cmllu05wr007fnw263pcca89z	440	Bulk Purchase: 4x Wood. (Items Cost: 440 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:28:52.878
cmllxrd67000xqo01dvh9pql2	cmllu05wr007fnw263pcca89z	4	Acquired: 4x Wood	CREDIT	RAW	2026-02-14 06:28:52.974
cmllxs0jz0011qo018iezkoh9	cmllu0gh8008dnw26sfpjylw0	1650	Bulk Purchase: 15x Wood. (Items Cost: 1650 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:29:23.28
cmllxs0mp0013qo01i8fikh9w	cmllu0gh8008dnw26sfpjylw0	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 06:29:23.377
cmllxs23p0019qo016qp3i9fq	cmllu0ik5008lnw26o95uvsly	14800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:29:25.285
cmllxsnbk001bqo01m9d2n86v	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:29:52.784
cmllxt11u001dqo01j6ojs6j4	cmlltzzi0006rnw2673ipn4ol	10420	Bulk Purchase: 47x Wood, 14x Metal. (Items Cost: 10420 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:30:10.579
cmllxt14n001fqo01p2h66f02	cmlltzzi0006rnw2673ipn4ol	61	Acquired: 47x Wood, 14x Metal	CREDIT	RAW	2026-02-14 06:30:10.68
cmllxt6rf001hqo01med2yoaa	cmllu08dp007rnw26v4dgmp23	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:30:17.881
cmllxt82i001jqo01wtmzgdz4	cmlltzxsz006hnw267qcl5gqp	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:30:19.577
cmllxtcs1001lqo01l1sxocol	cmlltzyhy006lnw26tbnvyy6x	1925	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:30:25.776
cmllxtcs2001nqo01xok1e25o	cmlltzyhy006lnw26tbnvyy6x	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:30:25.776
cmllxtnkx001pqo018u5d6f0p	cmllu0bxd0083nw26cle9wtdh	4450	Sold 1x Magnifying Glass for 4450 Eternites	CREDIT	CRAFT	2026-02-14 06:30:39.777
cmllxtnky001rqo01ge17n4wr	cmllu0bxd0083nw26cle9wtdh	3900	Sold 1x Dividers for 3900 Eternites	CREDIT	CRAFT	2026-02-14 06:30:39.777
cmllxtz02001tqo01rni7mhfb	cmlltzwvk006dnw261evs8qz0	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:30:54.578
cmllxu7n9001vqo012y9x9jhb	cmllu082g007pnw26i9kqife7	1100	Sold 10x Wood for 1100 Eternites	CREDIT	RAW	2026-02-14 06:31:05.781
cmllxu7n9001xqo01nlwhc4vw	cmllu082g007pnw26i9kqife7	860	Sold 4x Water for 860 Eternites	CREDIT	RAW	2026-02-14 06:31:05.781
cmllxukj5001zqo01271q9ux4	cmllu004r006vnw263zlbwtzm	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:31:22.48
cmllxun2q0023qo01c1foue7c	cmlltzzt8006tnw26kuftz5q9	10125	Bulk Purchase: 27x Metal. (Items Cost: 10125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:31:25.779
cmllxun2w0025qo01gow25055	cmlltzzt8006tnw26kuftz5q9	27	Acquired: 27x Metal	CREDIT	RAW	2026-02-14 06:31:25.784
cmllxuwn50029qo01uimpm9mo	cmllu07os007nnw2657lw1mt3	5625	Bulk Purchase: 15x Metal. (Items Cost: 5625 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:31:38.178
cmllxuwpt002bqo01zjk1fzfa	cmllu07os007nnw2657lw1mt3	15	Acquired: 15x Metal	CREDIT	RAW	2026-02-14 06:31:38.273
cmllxv1qf002fqo01lurs7ql9	cmlltzy4f006jnw264h8kyavc	1125	Bulk Purchase: 3x Metal. (Items Cost: 1125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:31:44.775
cmllxv1ql002hqo01wf3pbzqm	cmlltzy4f006jnw264h8kyavc	3	Acquired: 3x Metal	CREDIT	RAW	2026-02-14 06:31:44.782
cmllxvejq002jqo01r2frq7w3	cmllu08or007tnw26wd6mv6wd	24400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:32:01.382
cmllxvf30002lqo01xsal5txp	cmllu02a60073nw26f5vv4wcw	2200	Bulk Purchase: 20x Wood. (Items Cost: 2200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:32:02.076
cmllxvf39002nqo01fyckaok6	cmllu02a60073nw26f5vv4wcw	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 06:32:02.085
cmllxvh8s002pqo010plv25r7	cmllu0i3k008jnw26vfsdew9m	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:32:04.876
cmllxwbvm002rqo01jwlob8zn	cmllu0jsw008pnw26umu3i0fj	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:32:44.579
cmllxwe44002tqo014c549p3j	cmllu0l6u008vnw26jnnl3z1k	550	Sold 5x Wood for 550 Eternites	CREDIT	RAW	2026-02-14 06:32:47.473
cmllxwgns002vqo01usqu8qgr	cmllu0ep90087nw26uyzbvykl	4095900	Pitching Reward (USD)	CREDIT	USD	2026-02-14 06:32:50.685
cmllxwmg1002xqo01jf0yohe4	cmllu0l6u008vnw26jnnl3z1k	550	Sold 5x Wood for 550 Eternites	CREDIT	RAW	2026-02-14 06:32:58.184
cmllxwogg002zqo01sghcsphi	cmlltzwho006bnw2675cqbryr	34000000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:33:00.88
cmllxwtjm0031qo01e4a6b136	cmllu0hmt008hnw26efktlnfg	95	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:33:07.284
cmllxwtjm0033qo01ughp7327	cmllu0hmt008hnw26efktlnfg	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:33:07.284
cmllxwubf0035qo01a8ondcfy	cmllu0l6u008vnw26jnnl3z1k	550	Sold 5x Wood for 550 Eternites	CREDIT	RAW	2026-02-14 06:33:08.474
cmllxwwv70039qo01ennxsmyx	cmllu0h0u008fnw2603crdwbl	1325	Bulk Purchase: 5x Coal. (Items Cost: 1325 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:33:11.779
cmllxwwvb003bqo01jfxy5b4u	cmllu0h0u008fnw2603crdwbl	5	Acquired: 5x Coal	CREDIT	RAW	2026-02-14 06:33:11.784
cmllxwzvh003dqo01l1d2ov65	cmlltzyhy006lnw26tbnvyy6x	2365	Sold 11x Water for 2365 Eternites	CREDIT	RAW	2026-02-14 06:33:15.677
cmllxx1nk003fqo01dcpao6bn	cmllu03le0077nw267n1s0mb6	2935	Bulk Purchase: 2x Glass, 5x Metal. (Items Cost: 2935 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:33:17.984
cmllxx1q3003hqo01krgqmyp3	cmllu03le0077nw267n1s0mb6	7	Acquired: 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 06:33:18.075
cmllxxdj8003lqo01l88x2vpw	cmllu095j007vnw26ikcqk5fx	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:33:33.38
cmllxxdlz003nqo01fxty0gff	cmllu095j007vnw26ikcqk5fx	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 06:33:33.479
cmllxxdm3003pqo01aqczqg2x	cmllu095j007vnw26ikcqk5fx	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 06:33:33.484
cmllxxdor003rqo01soin1xep	cmllu095j007vnw26ikcqk5fx	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 06:33:33.579
cmllxxdrn003tqo01yo9cs446	cmllu082g007pnw26i9kqife7	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:33:33.677
cmllxxm67003vqo01h6iewzml	cmllu004r006vnw263zlbwtzm	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:33:44.575
cmllxy1lx003zqo013aprczy1	cmllu0mw10093nw26ppcub6u6	2150	Sold 10x Water for 2150 Eternites	CREDIT	RAW	2026-02-14 06:34:04.581
cmllxykct0041qo013jauqxfi	cmllu0j14008nnw269ihx0pxl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:34:28.877
cmllxyq2c0043qo01f6c9tk2c	cmllu0dry0085nw26fee82749	1325	Bulk Purchase: 1x Glass, 3x Coal. (Items Cost: 1325 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:34:36.277
cmllxyqam0045qo014nra5j5o	cmllu0dry0085nw26fee82749	4	Acquired: 1x Glass, 3x Coal	CREDIT	RAW	2026-02-14 06:34:36.574
cmllxz16j0047qo01l2b3lk9k	cmllu04r7007bnw26zxtj1wy7	3680	Bulk Purchase: 10x Wood, 12x Water. (Items Cost: 3680 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:34:50.683
cmllxz1960049qo01j03ph6qd	cmllu04r7007bnw26zxtj1wy7	22	Acquired: 10x Wood, 12x Water	CREDIT	RAW	2026-02-14 06:34:50.778
cmllxzyqp004bqo01re8m985m	cmllu09jj007xnw26irsp7nwv	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:35:34.076
cmlly7kw80003qo01fu5zz8xz	cmllu0gh8008dnw26sfpjylw0	3150	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:41:29.384
cmlly7kw80005qo01wvjwyq4d	cmllu0gh8008dnw26sfpjylw0	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:41:29.384
cmlly7oli0007qo01zqf76c23	cmllu04r7007bnw26zxtj1wy7	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:41:34.279
cmlly7oqz0009qo01y4y0kr5o	cmllu04r7007bnw26zxtj1wy7	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 06:41:34.475
cmlly7ou2000bqo01r5lkxyqz	cmllu04r7007bnw26zxtj1wy7	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:41:34.587
cmlly7ozi000dqo01x1k7icb0	cmllu04r7007bnw26zxtj1wy7	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 06:41:34.782
cmlm1grfh01k7qo01umv0buaf	cmllu05ad007dnw26h2vqc9kh	1605	Sold 3x Glass for 1605 Eternites	CREDIT	RAW	2026-02-14 08:12:36.701
cmlm1kgrm01mfqo01nbg3xhw1	cmllu0h0u008fnw2603crdwbl	4345	Sold 11x Metal for 4345 Eternites	CREDIT	RAW	2026-02-14 08:15:29.506
cmlm1kmh401mlqo016dmsb39i	cmllu0j14008nnw269ihx0pxl	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:15:36.904
cmlm1l6ou01n1qo01wv481aml	cmllu08dp007rnw26v4dgmp23	1975	Sold 5x Metal for 1975 Eternites	CREDIT	RAW	2026-02-14 08:16:03.082
cmlm1ltdo01nnqo01uv2md7i2	cmllu03le0077nw267n1s0mb6	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:16:32.508
cmlm2797o01yhqo018dqykqgo	cmllu0bxd0083nw26cle9wtdh	26620	Sold 121x Water for 26620 Eternites	CREDIT	RAW	2026-02-14 08:33:12.804
cmlm279zh01yjqo01e7hfo2rx	cmllu09jj007xnw26irsp7nwv	350	Sold 1x Metal for 350 Eternites	CREDIT	RAW	2026-02-14 08:33:13.804
cmlm27skz01ypqo01gr2szkn1	cmllu0gh8008dnw26sfpjylw0	1250	Sold 10x Wood for 1250 Eternites	CREDIT	RAW	2026-02-14 08:33:37.907
cmlm27t1p01yrqo01sno12tdn	cmllu0l6u008vnw26jnnl3z1k	12760	Sold 58x Water for 12760 Eternites	CREDIT	RAW	2026-02-14 08:33:38.509
cmlm2azet020dqo01k6jcqlzn	cmllu082g007pnw26i9kqife7	9250	Sold 74x Wood for 9250 Eternites	CREDIT	RAW	2026-02-14 08:36:06.725
cmlm2bwkn020pqo01wfb1l4b8	cmllu00w3006znw26zc4y9ek0	5100	Sold 2x Brown Paper for 5100 Eternites	CREDIT	CRAFT	2026-02-14 08:36:49.703
cmlly9ki1000fqo01wb670y77	cmllu05ad007dnw26h2vqc9kh	220	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 06:43:02.188
cmlly9ki1000hqo01vhrceftx	cmllu05ad007dnw26h2vqc9kh	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 06:43:02.188
cmllybbm8000jqo013z9o2k7b	cmllu08or007tnw26wd6mv6wd	2200	Bulk Purchase: 20x Wood. (Items Cost: 2200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:44:24.081
cmllybbp1000lqo012m4dr06v	cmllu08or007tnw26wd6mv6wd	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 06:44:24.182
cmllybhxy000pqo01cxu21aka	cmllu05ad007dnw26h2vqc9kh	2500	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:44:32.184
cmllybhxy000rqo01it8hrcoj	cmllu05ad007dnw26h2vqc9kh	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:44:32.184
cmllyc0gt000tqo018vkhyfhd	cmllu09jj007xnw26irsp7nwv	24400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:44:56.285
cmllyd3l5000vqo01qq60iw89	cmllu08dp007rnw26v4dgmp23	1650	Bulk Purchase: 15x Wood. (Items Cost: 1650 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:45:46.985
cmllyd3t8000xqo01zqwjkz12	cmllu08dp007rnw26v4dgmp23	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 06:45:47.185
cmllygxs40011qo01c3lqbptk	cmllu02z70075nw267utb00t1	3500	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 06:48:45.889
cmllygxs40013qo015h8dgre8	cmllu02z70075nw267utb00t1	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 06:48:45.889
cmllyh7480015qo01jli33arj	cmllu02a60073nw26f5vv4wcw	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:48:58.084
cmllyilf60017qo010mierdeh	cmllu004r006vnw263zlbwtzm	-3400000	Converted 3400000 USD to IDR	DEBIT	USD	2026-02-14 06:50:03.186
cmllyilf60019qo01ubsjjxqo	cmllu004r006vnw263zlbwtzm	54362600000	Received 54362600000 IDR from USD	CREDIT	IDR	2026-02-14 06:50:03.186
cmllyipwf001bqo01nmx3me2x	cmlltzxsz006hnw267qcl5gqp	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 06:50:09.182
cmllyiwb4001dqo01p4orkwuu	cmlltzxsz006hnw267qcl5gqp	31600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:50:17.488
cmllyj467001fqo01ngcaxfiz	cmllu00w3006znw26zc4y9ek0	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:50:27.587
cmllyj5ss001hqo01cf7awsll	cmllu05ad007dnw26h2vqc9kh	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:50:29.782
cmllyj8q1001jqo01wjtc1ud7	cmllu0mw10093nw26ppcub6u6	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:50:33.485
cmllyjda0001lqo01qfuux2nn	cmllu03le0077nw267n1s0mb6	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:50:39.479
cmllyjfft001nqo01bporh1w9	cmlltzz1o006pnw26ztynyxv4	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:50:42.281
cmllyjvvp001pqo01msb1k1th	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:51:03.589
cmllyjw6l001rqo01w3y1kf4v	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:51:03.982
cmllyjwew001tqo01kkx8n7w1	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:51:04.28
cmllyjwkk001vqo01r1lcmtxn	cmllu03le0077nw267n1s0mb6	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:51:04.484
cmllyjwnd001xqo0139139pi1	cmllu03le0077nw267n1s0mb6	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:51:04.584
cmllykes4001zqo01g9ty6780	cmlltzwvk006dnw261evs8qz0	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 06:51:28.08
cmllykfxs0021qo018x5ymz11	cmllu02z70075nw267utb00t1	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:51:29.579
cmllyktac0023qo014c9shl64	cmlltzyqo006nnw26bdi47ek8	4200	Sold 35x Wood for 4200 Eternites	CREDIT	RAW	2026-02-14 06:51:46.878
cmllyktad0025qo01avz708bv	cmlltzyqo006nnw26bdi47ek8	2025	Sold 5x Metal for 2025 Eternites	CREDIT	RAW	2026-02-14 06:51:46.878
cmllyl4xo0027qo01p023lu3r	cmllu0ik5008lnw26o95uvsly	530	Sold 1x Glass for 530 Eternites	CREDIT	RAW	2026-02-14 06:52:01.979
cmllyp8rx0029qo01ndgd8d11	cmllu05wr007fnw263pcca89z	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:55:13.581
cmllyp90d002bqo01a11ay9b7	cmllu0jsw008pnw26umu3i0fj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:55:13.885
cmllyp9rz002dqo01daiodhgv	cmllu0gh8008dnw26sfpjylw0	810	Sold 2x Metal for 810 Eternites	CREDIT	RAW	2026-02-14 06:55:14.789
cmllyp9rz002fqo01whptba6r	cmllu0gh8008dnw26sfpjylw0	4450	Sold 1x Magnifying Glass for 4450 Eternites	CREDIT	CRAFT	2026-02-14 06:55:14.789
cmllyp9s0002hqo01crkr6qfv	cmllu0gh8008dnw26sfpjylw0	4000	Sold 1x Dividers for 4000 Eternites	CREDIT	CRAFT	2026-02-14 06:55:14.789
cmllypb0g002jqo01fbdwrcev	cmllu0fek0089nw26lw6emt67	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:55:16.481
cmllypfvf002lqo019d1imjxm	cmllu0bdv0081nw26gpystvor	2025	Sold 5x Metal for 2025 Eternites	CREDIT	RAW	2026-02-14 06:55:22.685
cmllypn7b002nqo010t4badn3	cmllu09jj007xnw26irsp7nwv	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 06:55:32.279
cmllypyp8002pqo01qv249uqb	cmllu0i3k008jnw26vfsdew9m	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:55:47.086
cmllyq08s002tqo011vn7u96x	cmlltzyqo006nnw26bdi47ek8	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:55:49.18
cmllyq0bk002vqo01gag8vbt8	cmlltzyqo006nnw26bdi47ek8	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:55:49.28
cmllyq0bs002xqo01cc4qbivr	cmlltzyqo006nnw26bdi47ek8	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:55:49.289
cmllyq0jy002zqo01vkl4k8ng	cmlltzyqo006nnw26bdi47ek8	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:55:49.582
cmllyq0mt0031qo01qlefrsem	cmlltzyqo006nnw26bdi47ek8	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:55:49.685
cmllyq0s90033qo018pkngo4r	cmllu0l6u008vnw26jnnl3z1k	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 06:55:49.788
cmllyq0sa0035qo01lfrype3p	cmllu0l6u008vnw26jnnl3z1k	4560	Sold 16x Coal for 4560 Eternites	CREDIT	RAW	2026-02-14 06:55:49.788
cmllyq0v20037qo01djnqiu50	cmlltzzi0006rnw2673ipn4ol	5640	Sold 47x Wood for 5640 Eternites	CREDIT	RAW	2026-02-14 06:55:49.98
cmllyq0v30039qo01xqsk37vq	cmlltzzi0006rnw2673ipn4ol	5670	Sold 14x Metal for 5670 Eternites	CREDIT	RAW	2026-02-14 06:55:49.98
cmllyq84b003bqo01bg233jvs	cmllu00kw006xnw261mwscl7e	1850	Bulk Purchase: 10x Water. (Items Cost: 1850 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:55:59.387
cmllyq8ci003dqo01uxud90u7	cmllu00kw006xnw261mwscl7e	10	Acquired: 10x Water	CREDIT	RAW	2026-02-14 06:55:59.683
cmllyqacx003lqo01y5ui7x8j	cmllu06wy007jnw26xy0x6dn5	3225	Bulk Purchase: 10x Wood, 5x Metal. (Items Cost: 3225 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:56:02.288
cmllyqai8003nqo014uuvur5e	cmllu06wy007jnw26xy0x6dn5	15	Acquired: 10x Wood, 5x Metal	CREDIT	RAW	2026-02-14 06:56:02.48
cmllyqany003rqo01c18lfrg7	cmllu0dry0085nw26fee82749	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:56:02.687
cmllyqate003tqo01you7ri27	cmllu0dry0085nw26fee82749	3	Bulk Crafted: 1x Brown Paper, 1x Pen, 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:56:02.881
cmllyqawe003vqo01wpl343kd	cmllu0dry0085nw26fee82749	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 06:56:02.99
cmllyqb1v003xqo01fwvkm06u	cmllu0dry0085nw26fee82749	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 06:56:03.187
cmllyqbct003zqo01pgys6wx6	cmllu0dry0085nw26fee82749	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 06:56:03.581
cmllyqbfk0041qo01amtxnn5w	cmllu0dry0085nw26fee82749	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:56:03.681
cmllyqbl70043qo01udrjpyla	cmllu0dry0085nw26fee82749	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:56:03.884
cmlm1h23301kbqo019iungyu6	cmllu0i3k008jnw26vfsdew9m	11850	Sold 30x Metal for 11850 Eternites	CREDIT	RAW	2026-02-14 08:12:50.509
cmlm1h25t01kdqo01g4jbr5kb	cmlltzvq60067nw26qemjfwxj	15240	Sold 127x Wood for 15240 Eternites	CREDIT	RAW	2026-02-14 08:12:50.608
cmlm1h76801khqo01ttpp6qtp	cmllu03le0077nw267n1s0mb6	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 08:12:57.104
cmlm1hgfn01kpqo01r3idtpjp	cmllu0ofe0099nw26n7luunss	720	Sold 6x Wood for 720 Eternites	CREDIT	RAW	2026-02-14 08:13:09.107
cmlm1hgfo01krqo01mjmqti4u	cmllu0ofe0099nw26n7luunss	3950	Sold 10x Metal for 3950 Eternites	CREDIT	RAW	2026-02-14 08:13:09.107
cmlm1hgl601ktqo01xr0la2by	cmllu0jsw008pnw26umu3i0fj	600	Sold 5x Wood for 600 Eternites	CREDIT	RAW	2026-02-14 08:13:09.306
cmlm27tt901ytqo0113tbk866	cmllu0h0u008fnw2603crdwbl	4620	Sold 21x Water for 4620 Eternites	CREDIT	RAW	2026-02-14 08:33:39.501
cmlm285ur01yzqo017wjpf7mv	cmlltzwvk006dnw261evs8qz0	1980	Sold 9x Water for 1980 Eternites	CREDIT	RAW	2026-02-14 08:33:55.106
cmlm29qy601zhqo01fdh7ns5h	cmllu08dp007rnw26v4dgmp23	5000	Sold 40x Wood for 5000 Eternites	CREDIT	RAW	2026-02-14 08:35:09.102
cmlm29qy601zjqo01g5u36ari	cmllu08dp007rnw26v4dgmp23	660	Sold 3x Water for 660 Eternites	CREDIT	RAW	2026-02-14 08:35:09.102
cmlm2ab3d01zzqo01q0rgox48	cmllu06j7007hnw26uw0sp36v	8580	Sold 39x Water for 8580 Eternites	CREDIT	RAW	2026-02-14 08:35:35.209
cmlm2ayh80205qo01vwg6q6bw	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:36:05.516
cmlm2ayhb0207qo01cle19z3n	cmllu00w3006znw26zc4y9ek0	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 08:36:05.52
cmlm2ayhf0209qo01ono3eu6h	cmllu00w3006znw26zc4y9ek0	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 08:36:05.523
cmlm2ayhg020bqo01bvuif5a1	cmllu00w3006znw26zc4y9ek0	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 08:36:05.524
cmlm2brek020lqo019b89rdex	cmllu0ofe0099nw26n7luunss	250	Sold 2x Wood for 250 Eternites	CREDIT	RAW	2026-02-14 08:36:43.003
cmlm2brel020nqo01otp25lwn	cmllu0ofe0099nw26n7luunss	6600	Sold 30x Water for 6600 Eternites	CREDIT	RAW	2026-02-14 08:36:43.003
cmlm2bwt2020tqo01yuagv9xf	cmllu0dry0085nw26fee82749	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:36:50.006
cmlm2bwt2020vqo01e000loqf	cmllu0dry0085nw26fee82749	5	Bulk Crafted: 3x Brown Paper, 2x Dividers	CREDIT	CRAFT	2026-02-14 08:36:50.007
cmlm2bwt3020xqo01nok0jkkt	cmllu0dry0085nw26fee82749	60	Consumed 60x Wood for crafting	DEBIT	RAW	2026-02-14 08:36:50.008
cmlm2bwt4020zqo014tknrhsw	cmllu0dry0085nw26fee82749	15	Consumed 15x Water for crafting	DEBIT	RAW	2026-02-14 08:36:50.008
cmlm2bwt50211qo01dwzyszlv	cmllu0dry0085nw26fee82749	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 08:36:50.009
cmllyqc7k0045qo018rh7y94c	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:56:04.687
cmllyrf3g0049qo01uybzgrrf	cmllu0bdv0081nw26gpystvor	925	Bulk Purchase: 5x Water. (Items Cost: 925 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:56:55.084
cmllyrf68004bqo01mk47f1ub	cmllu0bdv0081nw26gpystvor	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 06:56:55.185
cmllyrtoi004dqo01clv0jkef	cmlltzzi0006rnw2673ipn4ol	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:57:13.983
cmllys3v7004fqo01pdm3ius7	cmllu0hmt008hnw26efktlnfg	1425	Sold 5x Coal for 1425 Eternites	CREDIT	RAW	2026-02-14 06:57:27.181
cmllysc9u004hqo012fluqrf8	cmllu0ik5008lnw26o95uvsly	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 06:57:38.079
cmllyscyu004jqo01snmk18wv	cmllu0h0u008fnw2603crdwbl	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:57:38.884
cmllyseie004lqo01eudmxiys	cmllu05wr007fnw263pcca89z	1000	Thunt reward: 1000 Eternities	CREDIT	ETERNITES	2026-02-14 06:57:40.978
cmllysllz004pqo01gf8ovgzw	cmllu06wy007jnw26xy0x6dn5	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:57:50.183
cmllyslm4004rqo01w1qe9eke	cmllu06wy007jnw26xy0x6dn5	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:57:50.189
cmllyslos004tqo01omp86u90	cmllu06wy007jnw26xy0x6dn5	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:57:50.283
cmllyslrk004vqo0171jm8hj0	cmllu06wy007jnw26xy0x6dn5	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:57:50.384
cmllyslx8004xqo01jbwj2znn	cmllu06wy007jnw26xy0x6dn5	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:57:50.588
cmllysomf004zqo01ezgvg3bh	cmllu07os007nnw2657lw1mt3	6000	Sold 50x Wood for 6000 Eternites	CREDIT	RAW	2026-02-14 06:57:54.086
cmllyspp60051qo011d8gylku	cmllu0kvl008tnw26fe8h34vp	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 06:57:55.482
cmllysr8r0053qo01qqecwzzk	cmllu0ep90087nw26uyzbvykl	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:57:57.484
cmllystbt0055qo012cw9fb4z	cmlltzzt8006tnw26kuftz5q9	1800	Thunt reward: 1800 Eternities	CREDIT	ETERNITES	2026-02-14 06:58:00.183
cmllytari0057qo01qixpu70j	cmlltzz1o006pnw26ztynyxv4	1500	Thunt reward: 1500 Eternities	CREDIT	ETERNITES	2026-02-14 06:58:22.781
cmllyte090059qo01wl9lf97l	cmllu02a60073nw26f5vv4wcw	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 06:58:26.985
cmllytg8p005bqo01ls1i4cou	cmllu0i3k008jnw26vfsdew9m	4650	Bulk Purchase: 5x Wood, 10x Metal. (Items Cost: 4650 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:58:29.882
cmllytg8s005dqo01pdgjizye	cmllu0i3k008jnw26vfsdew9m	15	Acquired: 5x Wood, 10x Metal	CREDIT	RAW	2026-02-14 06:58:29.885
cmllytj6e005fqo01takyhv83	cmlltzy4f006jnw264h8kyavc	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 06:58:33.685
cmllytk3n005hqo01lbbg8dvy	cmllu04r7007bnw26zxtj1wy7	6000	Sold 3x Brown Paper for 6000 Eternites	CREDIT	CRAFT	2026-02-14 06:58:34.883
cmllytpqe005jqo01yngfomjr	cmllu07os007nnw2657lw1mt3	6075	Sold 15x Metal for 6075 Eternites	CREDIT	RAW	2026-02-14 06:58:42.182
cmllytqta005lqo014132r4wk	cmllu0gh8008dnw26sfpjylw0	7860	Bulk Purchase: 25x Wood, 12x Metal. (Items Cost: 7860 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 06:58:43.582
cmllytqw1005nqo014hxrutbd	cmllu0gh8008dnw26sfpjylw0	37	Acquired: 25x Wood, 12x Metal	CREDIT	RAW	2026-02-14 06:58:43.68
cmllyuifu005rqo01m8qoagp3	cmlltzw6n0069nw266t9ghu5c	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 06:59:19.387
cmllyuil8005tqo01meefx2f8	cmlltzw6n0069nw266t9ghu5c	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 06:59:19.58
cmllyuio0005vqo01dnro1490	cmlltzw6n0069nw266t9ghu5c	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 06:59:19.68
cmllyuio9005xqo01l718l6xs	cmlltzw6n0069nw266t9ghu5c	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 06:59:19.69
cmllyuiqu005zqo01t0olyl3p	cmlltzw6n0069nw266t9ghu5c	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 06:59:19.783
cmllyuk4s0061qo017xypry1c	cmlltzyqo006nnw26bdi47ek8	4450	Sold 1x Magnifying Glass for 4450 Eternites	CREDIT	CRAFT	2026-02-14 06:59:21.58
cmllyuu8s0063qo01uixlit7e	cmllu00w3006znw26zc4y9ek0	22000000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 06:59:34.684
cmllyuy990065qo01fzouv6yr	cmllu02a60073nw26f5vv4wcw	8000	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 06:59:39.883
cmllyuy990067qo01013en3xt	cmllu02a60073nw26f5vv4wcw	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 06:59:39.883
cmllyv7ny0069qo01lhyge3m0	cmllu07os007nnw2657lw1mt3	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 06:59:51.987
cmllyvh8m006bqo01azpogivk	cmllu082g007pnw26i9kqife7	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:00:04.397
cmllyvjmn006fqo01nqymd35x	cmllu095j007vnw26ikcqk5fx	1940	Bulk Purchase: 10x Wood, 4x Water. (Items Cost: 1940 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:00:07.584
cmllyvjms006hqo01bdr4ww0m	cmllu095j007vnw26ikcqk5fx	14	Acquired: 10x Wood, 4x Water	CREDIT	RAW	2026-02-14 07:00:07.588
cmllyvjv1006jqo0114o0pbsd	cmllu044s0079nw26frbt1r2i	480	Sold 4x Wood for 480 Eternites	CREDIT	RAW	2026-02-14 07:00:07.885
cmllyvn9h006lqo01wmi56ldf	cmlltzzt8006tnw26kuftz5q9	10935	Sold 27x Metal for 10935 Eternites	CREDIT	RAW	2026-02-14 07:00:12.293
cmllyvovp006nqo011syvmeaj	cmllu0fek0089nw26lw6emt67	54400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:00:14.29
cmllyvr49006pqo01em7qusyn	cmllu044s0079nw26frbt1r2i	480	Sold 4x Wood for 480 Eternites	CREDIT	RAW	2026-02-14 07:00:17.288
cmllyw2oz006rqo01tb5a6y3c	cmlltzwho006bnw2675cqbryr	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:00:32.183
cmllywb0x006tqo0173ec8n62	cmllu02a60073nw26f5vv4wcw	6640	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 07:00:43.086
cmllywb0x006vqo01twf55s24	cmllu02a60073nw26f5vv4wcw	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 07:00:43.086
cmllywbpp006xqo01r0pld0ep	cmllu00kw006xnw261mwscl7e	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 07:00:43.891
cmllywmfx006zqo01l4cuitfz	cmlltzw6n0069nw266t9ghu5c	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 07:00:57.885
cmllywmfx0071qo01p2l2q9fa	cmlltzw6n0069nw266t9ghu5c	2280	Sold 8x Coal for 2280 Eternites	CREDIT	RAW	2026-02-14 07:00:57.885
cmllywmfy0073qo01gqq019dt	cmlltzw6n0069nw266t9ghu5c	4450	Sold 1x Magnifying Glass for 4450 Eternites	CREDIT	CRAFT	2026-02-14 07:00:57.885
cmllywp560075qo01a4p5c5y4	cmlltzyqo006nnw26bdi47ek8	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:01:01.381
cmllyx10u0077qo01j7yihdvo	cmllu00w3006znw26zc4y9ek0	2300	Sold 1x Ink for 2300 Eternites	CREDIT	CRAFT	2026-02-14 07:01:16.781
cmllyxe7u0079qo01m8p2sb16	cmllu0kvl008tnw26fe8h34vp	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:01:33.882
cmllyxr3t007bqo01nz2sswfu	cmlltzzi0006rnw2673ipn4ol	9780	Bulk Purchase: 41x Wood, 12x Metal. (Items Cost: 9780 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:01:50.586
cmllyxr6j007dqo01iobtzr7j	cmlltzzi0006rnw2673ipn4ol	53	Acquired: 41x Wood, 12x Metal	CREDIT	RAW	2026-02-14 07:01:50.683
cmllyy01v007hqo01vb97ee8n	cmllu04r7007bnw26zxtj1wy7	6075	Bulk Purchase: 15x Metal. (Items Cost: 6075 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:02:02.179
cmllyy04u007jqo015d43z3ng	cmllu04r7007bnw26zxtj1wy7	15	Acquired: 15x Metal	CREDIT	RAW	2026-02-14 07:02:02.286
cmllyy4ar007lqo01nh1vq31u	cmllu03le0077nw267n1s0mb6	8000	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:02:07.683
cmllyy4ar007nqo01vu8eucsf	cmllu03le0077nw267n1s0mb6	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:02:07.683
cmlm1h6v501kfqo0184qdlthb	cmllu03le0077nw267n1s0mb6	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 08:12:56.705
cmlm27x7n01yvqo01ianl9va3	cmllu08or007tnw26wd6mv6wd	7040	Sold 32x Water for 7040 Eternites	CREDIT	RAW	2026-02-14 08:33:43.907
cmlm28dpw01z1qo01h78k8d04	cmlltzxsz006hnw267qcl5gqp	1250	Sold 10x Wood for 1250 Eternites	CREDIT	RAW	2026-02-14 08:34:05.222
cmlm28dpw01z3qo01w8p7m97e	cmlltzxsz006hnw267qcl5gqp	12540	Sold 57x Water for 12540 Eternites	CREDIT	RAW	2026-02-14 08:34:05.222
cmlm28ktp01z5qo013ni405oo	cmllu03le0077nw267n1s0mb6	2550	Sold 1x Brown Paper for 2550 Eternites	CREDIT	CRAFT	2026-02-14 08:34:14.509
cmlm28t0001z7qo01ekhdl20s	cmllu00kw006xnw261mwscl7e	1875	Sold 15x Wood for 1875 Eternites	CREDIT	RAW	2026-02-14 08:34:25.104
cmlm28t0101z9qo01y169lvr2	cmllu00kw006xnw261mwscl7e	5100	Sold 2x Brown Paper for 5100 Eternites	CREDIT	CRAFT	2026-02-14 08:34:25.104
cmlm297cj01zbqo01iouz48yb	cmllu0bdv0081nw26gpystvor	375	Sold 3x Wood for 375 Eternites	CREDIT	RAW	2026-02-14 08:34:43.699
cmlm297cj01zdqo019iwhbr3o	cmllu0bdv0081nw26gpystvor	1540	Sold 7x Water for 1540 Eternites	CREDIT	RAW	2026-02-14 08:34:43.699
cmlm2am7d0201qo017idat79f	cmllu004r006vnw263zlbwtzm	250	Sold 2x Wood for 250 Eternites	CREDIT	RAW	2026-02-14 08:35:49.609
cmlm2am7d0203qo01hx403fjn	cmllu004r006vnw263zlbwtzm	350	Sold 1x Metal for 350 Eternites	CREDIT	RAW	2026-02-14 08:35:49.609
cmlm2d0uo0213qo01fmisc1vx	cmlltzz1o006pnw26ztynyxv4	1750	Sold 5x Metal for 1750 Eternites	CREDIT	RAW	2026-02-14 08:37:41.904
cmllyy4ww007pqo01rc9q521a	cmlltzz1o006pnw26ztynyxv4	600	Sold 5x Wood for 600 Eternites	CREDIT	RAW	2026-02-14 07:02:08.48
cmlm1hlix01kvqo01aj85h3xh	cmllu0l6u008vnw26jnnl3z1k	12120	Sold 101x Wood for 12120 Eternites	CREDIT	RAW	2026-02-14 08:13:15.704
cmlm1hpxe01kxqo0111m6e0mw	cmllu08dp007rnw26v4dgmp23	360	Sold 3x Wood for 360 Eternites	CREDIT	RAW	2026-02-14 08:13:21.41
cmlm29w7701zrqo017i2lhgv4	cmlltzwho006bnw2675cqbryr	1500	Sold 12x Wood for 1500 Eternites	CREDIT	RAW	2026-02-14 08:35:15.907
cmlm29ynz01ztqo0151brsah4	cmllu0dry0085nw26fee82749	5000	Sold 40x Wood for 5000 Eternites	CREDIT	RAW	2026-02-14 08:35:19.103
cmlm29ynz01zvqo015s0b87gs	cmllu0dry0085nw26fee82749	4180	Sold 19x Water for 4180 Eternites	CREDIT	RAW	2026-02-14 08:35:19.103
cmllyychb007rqo0116qmmj3q	cmllu0jsw008pnw26umu3i0fj	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:02:18.287
cmllyzyt8007vqo01rsn3fxf1	cmllu0hmt008hnw26efktlnfg	2125	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:03:33.884
cmllyzyt9007xqo01hzbm1vw0	cmllu0hmt008hnw26efktlnfg	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 07:03:33.885
cmllz055h007zqo016qe7m57l	cmlltzzt8006tnw26kuftz5q9	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:03:42.101
cmllz0fh90085qo01io5end04	cmllu03le0077nw267n1s0mb6	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:03:55.485
cmllz1bf8008nqo01okovhmt3	cmllu08or007tnw26wd6mv6wd	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:04:36.883
cmlm1hus601kzqo012ktvni19	cmlltzy4f006jnw264h8kyavc	1975	Sold 5x Metal for 1975 Eternites	CREDIT	RAW	2026-02-14 08:13:27.702
cmlm1hybz01l1qo01edyi0hfc	cmlltzwho006bnw2675cqbryr	4300	Sold 1x Magnifying Glass for 4300 Eternites	CREDIT	CRAFT	2026-02-14 08:13:32.303
cmlm1i16w01l3qo011gezyu8v	cmllu0ep90087nw26uyzbvykl	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 08:13:36.008
cmlm1i16w01l5qo01gbnfrhj4	cmllu0ep90087nw26uyzbvykl	535	Sold 1x Glass for 535 Eternites	CREDIT	RAW	2026-02-14 08:13:36.008
cmlm1j1ot01ljqo01nz4soz5j	cmlltzw6n0069nw266t9ghu5c	1000	Sold 5x Water for 1000 Eternites	CREDIT	RAW	2026-02-14 08:14:23.309
cmlm1jef501lpqo01db50v1p7	cmllu06wy007jnw26xy0x6dn5	3700	Sold 1x Pen for 3700 Eternites	CREDIT	CRAFT	2026-02-14 08:14:39.809
cmlm1jpzs01lvqo01i3axfy67	cmlltzzt8006tnw26kuftz5q9	8400	Sold 70x Wood for 8400 Eternites	CREDIT	RAW	2026-02-14 08:14:54.807
cmlm1jpzs01lxqo01063nf6hg	cmlltzzt8006tnw26kuftz5q9	1070	Sold 2x Glass for 1070 Eternites	CREDIT	RAW	2026-02-14 08:14:54.807
cmlm1jpzs01lzqo01w2hgfe56	cmlltzzt8006tnw26kuftz5q9	3000	Sold 15x Water for 3000 Eternites	CREDIT	RAW	2026-02-14 08:14:54.807
cmlm1jpzs01m1qo01ulyoe5w6	cmlltzzt8006tnw26kuftz5q9	4345	Sold 11x Metal for 4345 Eternites	CREDIT	RAW	2026-02-14 08:14:54.807
cmlm1k3oy01mdqo01avyjytlr	cmllu09jj007xnw26irsp7nwv	2400	Sold 20x Wood for 2400 Eternites	CREDIT	RAW	2026-02-14 08:15:12.562
cmlm1kmsc01mnqo01qn0csvxt	cmllu00w3006znw26zc4y9ek0	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:15:37.309
cmlm2b7sw020fqo01vt8r55bv	cmllu0mw10093nw26ppcub6u6	54400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:36:17.6
cmlm2b9w3020hqo01vkqg53bb	cmllu0dry0085nw26fee82749	7250	Bulk Purchase: 30x Wood, 10x Metal. (Items Cost: 7250 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:36:20.308
cmlm2b9w5020jqo01v8uykzmj	cmllu0dry0085nw26fee82749	40	Acquired: 30x Wood, 10x Metal	CREDIT	RAW	2026-02-14 08:36:20.309
cmlm2ezou0217qo01i26l9jf3	cmllu00w3006znw26zc4y9ek0	4700	Bulk Purchase: 20x Wood, 10x Water. (Items Cost: 4700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:39:13.71
cmlm2ezou0219qo0137vnttfy	cmllu00w3006znw26zc4y9ek0	30	Acquired: 20x Wood, 10x Water	CREDIT	RAW	2026-02-14 08:39:13.711
cmlm2gclu021jqo01ki1pk91r	cmllu04r7007bnw26zxtj1wy7	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:40:17.106
cmlm2glxy021lqo01kicrucho	cmllu0bxd0083nw26cle9wtdh	21515	Bulk Purchase: 65x Wood, 2x Glass, 19x Water, 10x Coal, 16x Metal. (Items Cost: 21515 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:40:29.206
cmlm2glxz021nqo01dd4c0bpq	cmllu0bxd0083nw26cle9wtdh	112	Acquired: 65x Wood, 2x Glass, 19x Water, 10x Coal, 16x Metal	CREDIT	RAW	2026-02-14 08:40:29.207
cmllyzrpr007tqo01kivykqf2	cmllu04r7007bnw26zxtj1wy7	1295	Sold 7x Water for 1295 Eternites	CREDIT	RAW	2026-02-14 07:03:24.687
cmllz05j00081qo0164uvjs3x	cmllu02z70075nw267utb00t1	8000	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:03:42.588
cmllz05j00083qo01p8azbzg4	cmllu02z70075nw267utb00t1	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:03:42.588
cmllz0tlg0087qo01tcojp9b0	cmllu02z70075nw267utb00t1	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:04:13.78
cmllz10xk008bqo014as7lng8	cmllu082g007pnw26i9kqife7	1050	Bulk Purchase: 2x Wood, 2x Metal. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:04:23.288
cmllz10xl008dqo01ycqwtq25	cmllu082g007pnw26i9kqife7	4	Acquired: 2x Wood, 2x Metal	CREDIT	RAW	2026-02-14 07:04:23.289
cmllz12s1008fqo0103b7jbgr	cmlltzwvk006dnw261evs8qz0	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:04:25.681
cmllz18hj008jqo01uxaakp31	cmlltzwho006bnw2675cqbryr	2025	Bulk Purchase: 5x Metal. (Items Cost: 2025 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:04:33.079
cmllz18hn008lqo01zohmx03g	cmlltzwho006bnw2675cqbryr	5	Acquired: 5x Metal	CREDIT	RAW	2026-02-14 07:04:33.083
cmllz1bhw008pqo01y2ovnvsh	cmllu05wr007fnw263pcca89z	120	Bulk Purchase: 1x Wood. (Items Cost: 120 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:04:36.98
cmllz1bi0008rqo01mu1vp5k3	cmllu05wr007fnw263pcca89z	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 07:04:36.984
cmllz1ial008tqo01ok3fiuh0	cmllu02z70075nw267utb00t1	360	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:04:45.789
cmllz1ial008vqo01qinbwn1j	cmllu02z70075nw267utb00t1	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:04:45.789
cmllz1j2b008xqo01bsp83zzx	cmllu0dry0085nw26fee82749	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:04:46.786
cmllz1l2f0091qo01gk8kxxj5	cmllu05wr007fnw263pcca89z	185	Bulk Purchase: 1x Water. (Items Cost: 185 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:04:49.384
cmllz1l2j0093qo01imzzbbi8	cmllu05wr007fnw263pcca89z	1	Acquired: 1x Water	CREDIT	RAW	2026-02-14 07:04:49.387
cmllz1q0c0095qo01p3ik2fjw	cmllu05wr007fnw263pcca89z	185	Bulk Purchase: 1x Water. (Items Cost: 185 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:04:55.788
cmllz1q0c0097qo01kyzjun1d	cmllu05wr007fnw263pcca89z	1	Acquired: 1x Water	CREDIT	RAW	2026-02-14 07:04:55.789
cmllz1s3a0099qo01ajfr6hii	cmllu02a60073nw26f5vv4wcw	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:04:58.486
cmllz1xyf009bqo01ii61k9hg	cmllu05wr007fnw263pcca89z	185	Bulk Purchase: 1x Water. (Items Cost: 185 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:05:06.087
cmllz1xyg009dqo011sjzmvdq	cmllu05wr007fnw263pcca89z	1	Acquired: 1x Water	CREDIT	RAW	2026-02-14 07:05:06.088
cmllz21yq009jqo0144qaxub1	cmlltzvq60067nw26qemjfwxj	8850	Bulk Purchase: 15x Water, 15x Metal. (Items Cost: 8850 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:05:11.282
cmllz21yv009lqo01plsbcxdy	cmlltzvq60067nw26qemjfwxj	30	Acquired: 15x Water, 15x Metal	CREDIT	RAW	2026-02-14 07:05:11.287
cmllz292a009nqo019emju9ap	cmllu05wr007fnw263pcca89z	370	Bulk Purchase: 2x Water. (Items Cost: 370 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:05:20.483
cmllz292d009pqo01pqdg0sro	cmllu05wr007fnw263pcca89z	2	Acquired: 2x Water	CREDIT	RAW	2026-02-14 07:05:20.485
cmllz2j3d009rqo01qci0u98t	cmlltzzt8006tnw26kuftz5q9	12480	Bulk Purchase: 104x Wood. (Items Cost: 12480 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:05:33.481
cmllz2j3e009tqo01endmbp51	cmlltzzt8006tnw26kuftz5q9	104	Acquired: 104x Wood	CREDIT	RAW	2026-02-14 07:05:33.482
cmllz2p9s009vqo01zwiff3qw	cmlltzy4f006jnw264h8kyavc	1500	Thunt reward: 1500 Eternities	CREDIT	ETERNITES	2026-02-14 07:05:41.487
cmllz2szb009xqo01j3jqy1og	cmllu0j14008nnw269ihx0pxl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:05:46.294
cmllz328f009zqo01ybsdtx35	cmllu0ep90087nw26uyzbvykl	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:05:58.287
cmllz39k900a1qo012ye9g205	cmllu0h0u008fnw2603crdwbl	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 07:06:07.785
cmllz3a9e00a5qo01rv74oj22	cmllu05wr007fnw263pcca89z	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:06:08.69
cmllz3a9f00a7qo01rtrjc5p4	cmllu05wr007fnw263pcca89z	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:06:08.691
cmllz3a9g00a9qo0124ugypvm	cmllu05wr007fnw263pcca89z	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:06:08.692
cmllz3abv00abqo01m936zv7q	cmllu05wr007fnw263pcca89z	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:06:08.779
cmllz3i1u00adqo01epi118uu	cmllu02z70075nw267utb00t1	570	Sold 2x Coal for 570 Eternites	CREDIT	RAW	2026-02-14 07:06:18.786
cmllz3pzt00afqo01rf6830he	cmllu07os007nnw2657lw1mt3	38800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:06:29.081
cmllz3sb900ahqo01p772pwmm	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:06:32.085
cmllz3y3n00ajqo014u1iagbb	cmlltzyhy006lnw26tbnvyy6x	1480	Bulk Purchase: 8x Water. (Items Cost: 1480 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:06:39.588
cmllz3y6800alqo01s1c03kp1	cmlltzyhy006lnw26tbnvyy6x	8	Acquired: 8x Water	CREDIT	RAW	2026-02-14 07:06:39.68
cmllz44t500anqo01mcw3kcu1	cmlltzy4f006jnw264h8kyavc	1215	Sold 3x Metal for 1215 Eternites	CREDIT	RAW	2026-02-14 07:06:48.281
cmllz4awu00arqo01q526tc4c	cmllu0jsw008pnw26umu3i0fj	3915	Bulk Purchase: 9x Wood, 7x Metal. (Items Cost: 3915 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:06:56.19
cmllz4awv00atqo01poo50wxm	cmllu0jsw008pnw26umu3i0fj	16	Acquired: 9x Wood, 7x Metal	CREDIT	RAW	2026-02-14 07:06:56.192
cmllz4ge100azqo01ghub2po9	cmlltzwvk006dnw261evs8qz0	770	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 07:07:03.289
cmllz4ggi00b1qo01va0kqszg	cmlltzwvk006dnw261evs8qz0	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 07:07:03.289
cmllz4pvn00b3qo018malw4c3	cmllu0i3k008jnw26vfsdew9m	2000	Thunt reward: 2000 Eternities	CREDIT	ETERNITES	2026-02-14 07:07:15.388
cmllz4qyg00b5qo01iovnun4n	cmlltzwvk006dnw261evs8qz0	500	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:07:16.982
cmllz4qyg00b7qo01hibus6oq	cmlltzwvk006dnw261evs8qz0	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:07:16.982
cmllz5mtq00b9qo0198npnxx1	cmllu00w3006znw26zc4y9ek0	925	Bulk Purchase: 5x Water. (Items Cost: 925 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:07:58.286
cmllz5mtq00bbqo01tusovqca	cmllu00w3006znw26zc4y9ek0	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 07:07:58.287
cmllz5oiq00bfqo01on5isqri	cmlltzy4f006jnw264h8kyavc	2775	Bulk Purchase: 15x Water. (Items Cost: 2775 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:08:00.482
cmllz5olg00bhqo019tbpvxtw	cmlltzy4f006jnw264h8kyavc	15	Acquired: 15x Water	CREDIT	RAW	2026-02-14 07:08:00.58
cmllz60ms00bjqo01myil46wn	cmllu08or007tnw26wd6mv6wd	3600	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:08:16.089
cmllz60ms00blqo01rey0zhw7	cmllu08or007tnw26wd6mv6wd	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:08:16.089
cmllz674b00bnqo01br1k6quk	cmllu0kvl008tnw26fe8h34vp	3600000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 07:08:24.587
cmllz6bwd00bpqo01vtrt6p5s	cmllu0jsw008pnw26umu3i0fj	855	Sold 3x Coal for 855 Eternites	CREDIT	RAW	2026-02-14 07:08:30.689
cmllz6o3f00brqo01prcs1eaz	cmllu0dry0085nw26fee82749	21000	Sold 3 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:08:46.586
cmllz6o3f00btqo01sokrs1pp	cmllu0dry0085nw26fee82749	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:08:46.586
cmllz7knq00cjqo01vhydlri2	cmllu0dry0085nw26fee82749	1350	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:09:28.789
cmllz7knq00clqo013elv320d	cmllu0dry0085nw26fee82749	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:09:28.789
cmlm1i4yv01l7qo010vixcfqf	cmlltzwvk006dnw261evs8qz0	1800	Sold 15x Wood for 1800 Eternites	CREDIT	RAW	2026-02-14 08:13:40.903
cmlm1ilvg01l9qo01d3fxm0ab	cmllu08or007tnw26wd6mv6wd	535	Sold 1x Glass for 535 Eternites	CREDIT	RAW	2026-02-14 08:14:02.812
cmlm1ilvg01lbqo01p5elncz2	cmllu08or007tnw26wd6mv6wd	3950	Sold 10x Metal for 3950 Eternites	CREDIT	RAW	2026-02-14 08:14:02.812
cmlm1iosw01ldqo01oqubxqqm	cmlltzyqo006nnw26bdi47ek8	8690	Sold 22x Metal for 8690 Eternites	CREDIT	RAW	2026-02-14 08:14:06.608
cmlm1ixtv01lfqo010kr0b9s5	cmllu0bxd0083nw26cle9wtdh	3600	Sold 30x Wood for 3600 Eternites	CREDIT	RAW	2026-02-14 08:14:18.307
cmlm1ixtv01lhqo01n4jxrrz6	cmllu0bxd0083nw26cle9wtdh	13825	Sold 35x Metal for 13825 Eternites	CREDIT	RAW	2026-02-14 08:14:18.307
cmlm1j5p701llqo01q10wf229	cmllu0hmt008hnw26efktlnfg	1320	Sold 11x Wood for 1320 Eternites	CREDIT	RAW	2026-02-14 08:14:28.312
cmlm1j5p801lnqo01sg1bjbcn	cmllu0hmt008hnw26efktlnfg	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:14:28.312
cmlm1jt3001m3qo01c9htc5cp	cmllu02z70075nw267utb00t1	3700	Sold 1x Pen for 3700 Eternites	CREDIT	CRAFT	2026-02-14 08:14:58.812
cmlm1jup501m5qo01eqqat5hr	cmllu00kw006xnw261mwscl7e	480	Sold 4x Wood for 480 Eternites	CREDIT	RAW	2026-02-14 08:15:00.906
cmlm1jup601m7qo01i7vq70fm	cmllu00kw006xnw261mwscl7e	2140	Sold 4x Glass for 2140 Eternites	CREDIT	RAW	2026-02-14 08:15:00.906
cmlm1kzqw01mtqo01hx17wy5n	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:15:54.104
cmlm1kztm01mvqo01xr83e6ky	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 08:15:54.109
cmlm1kztp01mxqo016ikv61p1	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:15:54.206
cmlm1kzwl01mzqo01oq3eja0c	cmllu03le0077nw267n1s0mb6	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 08:15:54.309
cmlm1lj4b01n9qo01k3yythxc	cmllu06j7007hnw26uw0sp36v	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:16:19.211
cmlm1lj4c01nbqo017eljwziv	cmllu06j7007hnw26uw0sp36v	2	Bulk Crafted: 1x Brown Paper, 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:16:19.212
cmlm1lj6u01ndqo018w7944hm	cmllu06j7007hnw26uw0sp36v	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 08:16:19.303
cmlm1lj6y01nfqo0128gmn8zo	cmllu06j7007hnw26uw0sp36v	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 08:16:19.305
cmlm1lj7201nhqo01wp89by5q	cmllu06j7007hnw26uw0sp36v	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:16:19.31
cmlm1lj7601njqo014haknhho	cmllu06j7007hnw26uw0sp36v	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:16:19.315
cmlm1ndk001obqo01n32zj9n2	cmllu0dry0085nw26fee82749	7400	Sold 2x Pen for 7400 Eternites	CREDIT	CRAFT	2026-02-14 08:17:45.309
cmlm1o5y301opqo01z3h5umz2	cmllu0fek0089nw26lw6emt67	7440	Sold 62x Wood for 7440 Eternites	CREDIT	RAW	2026-02-14 08:18:22.107
cmlm2dwpv0215qo01yvd0k1da	cmllu0kvl008tnw26fe8h34vp	625	Sold 5x Wood for 625 Eternites	CREDIT	RAW	2026-02-14 08:38:23.203
cmlm2fpgj021bqo013lnmoy90	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:39:47.107
cmlm2fpj2021dqo01g8s5n6vt	cmllu00w3006znw26zc4y9ek0	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 08:39:47.199
cmlm2fpj4021fqo01zo8gv9od	cmllu00w3006znw26zc4y9ek0	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 08:39:47.201
cmlm2fpj5021hqo01zdltxjbu	cmllu00w3006znw26zc4y9ek0	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 08:39:47.202
cmlm2hdsp021rqo013mkt6fo2	cmllu0dry0085nw26fee82749	7650	Sold 3x Brown Paper for 7650 Eternites	CREDIT	CRAFT	2026-02-14 08:41:05.305
cmlm2hdsp021tqo010hhz5tfv	cmllu0dry0085nw26fee82749	7200	Sold 2x Dividers for 7200 Eternites	CREDIT	CRAFT	2026-02-14 08:41:05.305
cmllz6ojv00bvqo01fkjttutu	cmllu0jsw008pnw26umu3i0fj	1480	Sold 8x Water for 1480 Eternites	CREDIT	RAW	2026-02-14 07:08:47.179
cmllz72aj00c1qo01zm80gymv	cmlltzyhy006lnw26tbnvyy6x	1480	Sold 8x Water for 1480 Eternites	CREDIT	RAW	2026-02-14 07:09:04.987
cmllz72aj00c3qo01enb9jdci	cmlltzyhy006lnw26tbnvyy6x	1995	Sold 7x Coal for 1995 Eternites	CREDIT	RAW	2026-02-14 07:09:04.987
cmllz8j2c00dhqo01vdkzavs6	cmllu02a60073nw26f5vv4wcw	4140	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:10:13.379
cmllz8j2c00djqo01atq6lftz	cmllu02a60073nw26f5vv4wcw	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:10:13.379
cmlm1jfvp01lrqo01vpusd1ym	cmllu08dp007rnw26v4dgmp23	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:14:41.701
cmlm1jp0z01ltqo018w664vwq	cmllu0l6u008vnw26jnnl3z1k	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:14:53.555
cmlm1jxsc01m9qo01ycbjk3n7	cmllu03le0077nw267n1s0mb6	1200	Bulk Purchase: 10x Wood. (Items Cost: 1200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:15:04.908
cmlm1jxsd01mbqo01kaw56vd3	cmllu03le0077nw267n1s0mb6	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:15:04.909
cmlm1kkux01mhqo01d3k5ybt1	cmllu06j7007hnw26uw0sp36v	1000	Bulk Purchase: 5x Water. (Items Cost: 1000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:15:34.81
cmlm1kkuy01mjqo01youvv5ut	cmllu06j7007hnw26uw0sp36v	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 08:15:34.811
cmlm1kp6c01mpqo01po1u413s	cmllu08or007tnw26wd6mv6wd	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:15:40.379
cmlm1lf1h01n3qo01pa2rzidc	cmllu00kw006xnw261mwscl7e	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:16:13.925
cmlm1ln1q01nlqo01zc29bw73	cmllu0hmt008hnw26efktlnfg	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:16:24.302
cmlm1myi501nvqo01xvt02h66	cmllu0ofe0099nw26n7luunss	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:17:25.804
cmlm1n6m001o5qo01dsfkafff	cmllu08dp007rnw26v4dgmp23	1200	Bulk Purchase: 10x Wood. (Items Cost: 1200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:17:36.312
cmlm1n6m101o7qo01m7m6gbbx	cmllu08dp007rnw26v4dgmp23	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:17:36.313
cmlm1na6j01o9qo01pkfxogeh	cmlltzzt8006tnw26kuftz5q9	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 08:17:40.94
cmlm1nduv01odqo01ez94w955	cmlltzxsz006hnw267qcl5gqp	2200	Thunt reward: 2200 Eternities	CREDIT	ETERNITES	2026-02-14 08:17:45.612
cmlm1nxrn01ofqo01g6udm26y	cmllu08dp007rnw26v4dgmp23	360	Bulk Purchase: 3x Wood. (Items Cost: 360 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:18:11.507
cmlm1nxrn01ohqo01zqbg193p	cmllu08dp007rnw26v4dgmp23	3	Acquired: 3x Wood	CREDIT	RAW	2026-02-14 08:18:11.508
cmlm1nxy601ojqo01lauk3bu2	cmllu02a60073nw26f5vv4wcw	2200	Thunt reward: 2200 Eternities	CREDIT	ETERNITES	2026-02-14 08:18:11.742
cmlm1o5es01olqo01u6rad486	cmllu04r7007bnw26zxtj1wy7	7900	Bulk Purchase: 20x Metal. (Items Cost: 7900 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:18:21.412
cmlm1o5es01onqo01ce47dvdp	cmllu04r7007bnw26zxtj1wy7	20	Acquired: 20x Metal	CREDIT	RAW	2026-02-14 08:18:21.413
cmlm1o6n001orqo01dox9wrdn	cmlltzyhy006lnw26tbnvyy6x	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 08:18:23.004
cmlm2gs44021pqo01647xh7fs	cmlltzvq60067nw26qemjfwxj	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:40:37.204
cmlm2iizg0223qo01pdjrm1h7	cmllu095j007vnw26ikcqk5fx	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:41:58.684
cmlm2ivuo0225qo011xwejrxm	cmllu00w3006znw26zc4y9ek0	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:42:15.36
cmlm2jaxp0227qo011pk28g93	cmllu0bxd0083nw26cle9wtdh	2200	Bulk Purchase: 10x Water. (Items Cost: 2200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:42:34.91
cmlm2jaxq0229qo01a62p369n	cmllu0bxd0083nw26cle9wtdh	10	Acquired: 10x Water	CREDIT	RAW	2026-02-14 08:42:34.91
cmlm2ko8t022hqo01i394uz2r	cmllu0bxd0083nw26cle9wtdh	1560	Bulk Purchase: 6x Coal. (Items Cost: 1560 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:43:38.813
cmlm2ko8t022jqo013pnf0d5s	cmllu0bxd0083nw26cle9wtdh	6	Acquired: 6x Coal	CREDIT	RAW	2026-02-14 08:43:38.814
cmlm2ldgv0233qo01f4iuq8v8	cmllu00w3006znw26zc4y9ek0	7050	Bulk Purchase: 30x Wood, 15x Water. (Items Cost: 7050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:44:11.504
cmlm2ldgw0235qo01lvfivaq8	cmllu00w3006znw26zc4y9ek0	45	Acquired: 30x Wood, 15x Water	CREDIT	RAW	2026-02-14 08:44:11.504
cmlm2lmjc0237qo01zmcdnqrm	cmllu06wy007jnw26xy0x6dn5	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 08:44:23.256
cmlm2mdnu023jqo01guzn9egs	cmllu02z70075nw267utb00t1	31600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:44:58.41
cmllz70wk00bxqo01frx2akvo	cmllu0mw10093nw26ppcub6u6	1800	Bulk Purchase: 15x Wood. (Items Cost: 1800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:03.187
cmllz70zf00bzqo01gl0hpda0	cmllu0mw10093nw26ppcub6u6	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 07:09:03.289
cmllz75zm00c9qo01h1in9i19	cmllu0ik5008lnw26o95uvsly	3225	Bulk Purchase: 10x Wood, 5x Metal. (Items Cost: 3225 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:09.778
cmllz75zt00cbqo01p8oprq6n	cmllu0ik5008lnw26o95uvsly	15	Acquired: 10x Wood, 5x Metal	CREDIT	RAW	2026-02-14 07:09:09.785
cmllz76x400cfqo01ovzro0ct	cmllu0j14008nnw269ihx0pxl	9705	Bulk Purchase: 10x Wood, 21x Metal. (Items Cost: 9705 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:10.984
cmllz76zv00chqo01w6kzc36q	cmllu0j14008nnw269ihx0pxl	31	Acquired: 10x Wood, 21x Metal	CREDIT	RAW	2026-02-14 07:09:11.084
cmllz7myt00cpqo01s9fwtt5g	cmllu09jj007xnw26irsp7nwv	810	Bulk Purchase: 2x Metal. (Items Cost: 810 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:31.781
cmllz7myu00crqo01qwchm5d2	cmllu09jj007xnw26irsp7nwv	2	Acquired: 2x Metal	CREDIT	RAW	2026-02-14 07:09:31.782
cmllz7rr700cvqo019rm99uk7	cmllu0bxd0083nw26cle9wtdh	4200	Bulk Purchase: 35x Wood. (Items Cost: 4200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:37.988
cmllz7ru000cxqo01rzd930aa	cmllu0bxd0083nw26cle9wtdh	35	Acquired: 35x Wood	CREDIT	RAW	2026-02-14 07:09:38.089
cmllz7wje00czqo019ensd1tl	cmlltzyqo006nnw26bdi47ek8	31600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:09:44.186
cmllz7y3100d1qo01n54khr08	cmllu0jsw008pnw26umu3i0fj	1620	Bulk Purchase: 4x Metal. (Items Cost: 1620 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:46.19
cmllz7ymf00d3qo01ymlnpzhz	cmllu0jsw008pnw26umu3i0fj	4	Acquired: 4x Metal	CREDIT	RAW	2026-02-14 07:09:46.789
cmllz84eo00d7qo0112ea0z2r	cmllu0bxd0083nw26cle9wtdh	2220	Bulk Purchase: 12x Water. (Items Cost: 2220 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:09:54.384
cmllz84eq00d9qo011uyzfjit	cmllu0bxd0083nw26cle9wtdh	12	Acquired: 12x Water	CREDIT	RAW	2026-02-14 07:09:54.386
cmllz8h7w00ddqo01bc9wh5rp	cmllu0bxd0083nw26cle9wtdh	3420	Bulk Purchase: 12x Coal. (Items Cost: 3420 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:10.988
cmllz8haf00dfqo01tmrc27mi	cmllu0bxd0083nw26cle9wtdh	12	Acquired: 12x Coal	CREDIT	RAW	2026-02-14 07:10:10.991
cmllz8oh200dlqo01w6wxq7v5	cmllu0i3k008jnw26vfsdew9m	2025	Bulk Purchase: 5x Metal. (Items Cost: 2025 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:20.391
cmllz8oh300dnqo0115h8q6q8	cmllu0i3k008jnw26vfsdew9m	5	Acquired: 5x Metal	CREDIT	RAW	2026-02-14 07:10:20.391
cmllz8tyl00drqo01da6y5bkv	cmllu0bxd0083nw26cle9wtdh	2025	Bulk Purchase: 5x Metal. (Items Cost: 2025 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:27.501
cmllz8u0z00dtqo01mowo2ndd	cmllu0bxd0083nw26cle9wtdh	5	Acquired: 5x Metal	CREDIT	RAW	2026-02-14 07:10:27.587
cmllz8uk700dvqo0192569aac	cmllu09jj007xnw26irsp7nwv	405	Bulk Purchase: 1x Metal. (Items Cost: 405 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:28.279
cmllz8un100dxqo01c8waipev	cmllu09jj007xnw26irsp7nwv	1	Acquired: 1x Metal	CREDIT	RAW	2026-02-14 07:10:28.382
cmllz8wq500dzqo01qkzhrb2s	cmllu05wr007fnw263pcca89z	2125	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:31.086
cmllz8wsw00e1qo016m705aay	cmllu05wr007fnw263pcca89z	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 07:10:31.185
cmllz8wvl00e3qo015q6pz909	cmlltzyhy006lnw26tbnvyy6x	2820	Bulk Purchase: 10x Wood, 4x Metal. (Items Cost: 2820 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:10:31.194
cmllz8wvn00e5qo01aazlltkj	cmlltzyhy006lnw26tbnvyy6x	14	Acquired: 10x Wood, 4x Metal	CREDIT	RAW	2026-02-14 07:10:31.283
cmllz90a300e7qo0187t4imkb	cmllu095j007vnw26ikcqk5fx	2300	Sold 1x Ink for 2300 Eternites	CREDIT	CRAFT	2026-02-14 07:10:35.692
cmllzatea00e9qo01jqj8xtnl	cmlltzy4f006jnw264h8kyavc	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:12:00.081
cmllzc6bc00ebqo01ti7qyjj1	cmllu0i3k008jnw26vfsdew9m	4150	Sold 10x Metal for 4150 Eternites	CREDIT	RAW	2026-02-14 07:13:03.48
cmllzc8ms00edqo01g9rahl4e	cmllu06j7007hnw26uw0sp36v	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:13:06.484
cmllzca3h00efqo01997xejr2	cmllu0i3k008jnw26vfsdew9m	4150	Sold 10x Metal for 4150 Eternites	CREDIT	RAW	2026-02-14 07:13:08.381
cmllzcaem00ehqo01pt63qtsy	cmllu05wr007fnw263pcca89z	1300	Bulk Purchase: 10x Wood. (Items Cost: 1300 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:13:08.783
cmllzcak600ejqo01mtnlndeu	cmllu05wr007fnw263pcca89z	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 07:13:08.982
cmllzcdst00elqo0180t1se8g	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:13:13.181
cmllzchqk00enqo01fvzko2t0	cmlltzyhy006lnw26tbnvyy6x	5200	Sold 40x Wood for 5200 Eternites	CREDIT	RAW	2026-02-14 07:13:18.284
cmllzcq8300epqo017yp2pqta	cmllu0dry0085nw26fee82749	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:13:29.281
cmllzcxk200erqo01a5d8gjjc	cmllu07dj007lnw261urdgi6e	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:13:38.787
cmllzd5tb00etqo016xalwg10	cmllu0gh8008dnw26sfpjylw0	1245	Sold 3x Metal for 1245 Eternites	CREDIT	RAW	2026-02-14 07:13:49.48
cmllzd6kz00evqo01l1f5fzfu	cmllu06wy007jnw26xy0x6dn5	3000	Sold 1x Pen for 3000 Eternites	CREDIT	CRAFT	2026-02-14 07:13:50.481
cmllzd6kz00exqo01ks16vioe	cmllu06wy007jnw26xy0x6dn5	4200	Sold 1x Magnifying Glass for 4200 Eternites	CREDIT	CRAFT	2026-02-14 07:13:50.481
cmllzdbir00ezqo011y53wzax	cmllu0l6u008vnw26jnnl3z1k	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:13:56.884
cmllzdh2z00f1qo0116mb5sr0	cmllu0j14008nnw269ihx0pxl	1300	Sold 10x Wood for 1300 Eternites	CREDIT	RAW	2026-02-14 07:14:04.09
cmllzdh2z00f3qo01ivuz87ez	cmllu0j14008nnw269ihx0pxl	8715	Sold 21x Metal for 8715 Eternites	CREDIT	RAW	2026-02-14 07:14:04.09
cmllzdp1000f5qo0128m3s0aq	cmllu05wr007fnw263pcca89z	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:14:14.389
cmllzdp3m00f7qo01n4kqwf0c	cmllu05wr007fnw263pcca89z	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:14:14.482
cmllzdp3n00f9qo017u1aikkt	cmllu05wr007fnw263pcca89z	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:14:14.484
cmllzdp3p00fbqo01f44e7lby	cmllu05wr007fnw263pcca89z	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:14:14.485
cmllzdtqf00fdqo0149rjpssm	cmlltzzt8006tnw26kuftz5q9	13520	Sold 104x Wood for 13520 Eternites	CREDIT	RAW	2026-02-14 07:14:20.487
cmllzdvck00fjqo01i0p7fvy7	cmllu0ep90087nw26uyzbvykl	1605	Bulk Purchase: 1x Glass, 5x Water, 1x Coal. (Items Cost: 1605 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:14:22.58
cmllzdvcr00flqo01dsgo00fx	cmllu0ep90087nw26uyzbvykl	7	Acquired: 1x Glass, 5x Water, 1x Coal	CREDIT	RAW	2026-02-14 07:14:22.587
cmllzdxno00fnqo01is7eo9r5	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:14:25.572
cmllze0lk00fpqo01zij50dbx	cmllu03le0077nw267n1s0mb6	3400000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 07:14:29.385
cmllze3gb00frqo01hmxvlw0c	cmlltzwvk006dnw261evs8qz0	-3500000	Converted 3500000 USD to IDR	DEBIT	USD	2026-02-14 07:14:33.082
cmllze3gb00ftqo01tlyavz7b	cmlltzwvk006dnw261evs8qz0	58198000000	Received 58198000000 IDR from USD	CREDIT	IDR	2026-02-14 07:14:33.082
cmlm0r2tc0177qo01gp86iavr	cmllu07dj007lnw261urdgi6e	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 07:52:38.401
cmllze6rv00fvqo01w31ib44z	cmllu004r006vnw263zlbwtzm	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 07:14:37.386
cmllzexjm00fzqo01zdj8pdcs	cmllu0dry0085nw26fee82749	9625	Bulk Purchase: 55x Water. (Items Cost: 9625 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:15:12.082
cmllzexjn00g1qo017sucio5d	cmllu0dry0085nw26fee82749	55	Acquired: 55x Water	CREDIT	RAW	2026-02-14 07:15:12.083
cmllzgjvt00ghqo013nri7oyc	cmlltzyhy006lnw26tbnvyy6x	980	Bulk Purchase: 2x Glass. (Items Cost: 980 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:16:27.689
cmllzgjvu00gjqo012cg28w9f	cmlltzyhy006lnw26tbnvyy6x	2	Acquired: 2x Glass	CREDIT	RAW	2026-02-14 07:16:27.69
cmllzgkcc00glqo01s0cesmxb	cmlltzw6n0069nw266t9ghu5c	980	Bulk Purchase: 2x Glass. (Items Cost: 980 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:16:28.285
cmllzgkce00gnqo017j338pr0	cmlltzw6n0069nw266t9ghu5c	2	Acquired: 2x Glass	CREDIT	RAW	2026-02-14 07:16:28.286
cmllzgvlx00grqo01yj29tmmq	cmllu095j007vnw26ikcqk5fx	2185	Bulk Purchase: 7x Water, 4x Coal. (Items Cost: 2185 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:16:42.885
cmllzgvly00gtqo01qpeljpje	cmllu095j007vnw26ikcqk5fx	11	Acquired: 7x Water, 4x Coal	CREDIT	RAW	2026-02-14 07:16:42.886
cmllzh0ju00gvqo018ha9fesr	cmllu07os007nnw2657lw1mt3	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:16:49.29
cmllzh4bt00h9qo01eouf8izx	cmllu03le0077nw267n1s0mb6	-3400000	Converted 3400000 USD to IDR	DEBIT	USD	2026-02-14 07:16:54.184
cmllzh4bt00hbqo012en7q7h8	cmllu03le0077nw267n1s0mb6	56535200000	Received 56535200000 IDR from USD	CREDIT	IDR	2026-02-14 07:16:54.184
cmlm1md7k01npqo01btw58sbo	cmlltzy4f006jnw264h8kyavc	7500	Sold 3x Brown Paper for 7500 Eternites	CREDIT	CRAFT	2026-02-14 08:16:58.208
cmlm1md7m01nrqo01gxhw5dlg	cmlltzy4f006jnw264h8kyavc	3700	Sold 1x Pen for 3700 Eternites	CREDIT	CRAFT	2026-02-14 08:16:58.208
cmlm1mvf601ntqo01ufr9jq6i	cmllu04r7007bnw26zxtj1wy7	8120	Sold 28x Coal for 8120 Eternites	CREDIT	RAW	2026-02-14 08:17:21.81
cmlm1myw501nxqo01nd7x7m9p	cmllu08or007tnw26wd6mv6wd	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:17:26.309
cmlm1mzw801nzqo01q2qlpzz0	cmllu06j7007hnw26uw0sp36v	1200	Sold 10x Wood for 1200 Eternites	CREDIT	RAW	2026-02-14 08:17:27.608
cmlm1mzw801o1qo0129u4opi9	cmllu06j7007hnw26uw0sp36v	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:17:27.608
cmlm1mzw901o3qo01ypaa5tuc	cmllu06j7007hnw26uw0sp36v	4300	Sold 1x Magnifying Glass for 4300 Eternites	CREDIT	CRAFT	2026-02-14 08:17:27.608
cmlm1qts401qvqo01pw8qm3el	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:20:26.307
cmlm1qtxt01qxqo01owcqsw2s	cmllu00w3006znw26zc4y9ek0	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 08:20:26.513
cmlm1qu5x01qzqo013vqveu9z	cmllu00w3006znw26zc4y9ek0	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 08:20:26.805
cmlm1qu6301r1qo01xbb1d407	cmllu00w3006znw26zc4y9ek0	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 08:20:26.812
cmlm1r94r01r3qo01autc3zsk	cmllu095j007vnw26ikcqk5fx	2500	Sold 1x Ink for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:20:46.203
cmlm1rlvd01r5qo018c97ypwn	cmllu00w3006znw26zc4y9ek0	5000	Sold 2x Brown Paper for 5000 Eternites	CREDIT	CRAFT	2026-02-14 08:21:02.713
cmlm1rm6f01r7qo01sa0pefv5	cmlltzyhy006lnw26tbnvyy6x	1070	Sold 2x Glass for 1070 Eternites	CREDIT	RAW	2026-02-14 08:21:03.111
cmlm1scya01rdqo0102nwtz4y	cmlltzxsz006hnw267qcl5gqp	1070	Sold 2x Glass for 1070 Eternites	CREDIT	RAW	2026-02-14 08:21:37.81
cmlm1scya01rfqo01yll9cwlv	cmlltzxsz006hnw267qcl5gqp	2320	Sold 8x Coal for 2320 Eternites	CREDIT	RAW	2026-02-14 08:21:37.81
cmlm1scyb01rhqo01q8wi2g2z	cmlltzxsz006hnw267qcl5gqp	790	Sold 2x Metal for 790 Eternites	CREDIT	RAW	2026-02-14 08:21:37.81
cmlm2hf9i021vqo011o9x6m9x	cmllu07os007nnw2657lw1mt3	1750	Sold 14x Wood for 1750 Eternites	CREDIT	RAW	2026-02-14 08:41:07.206
cmlm2hf9i021xqo018lauv42r	cmllu07os007nnw2657lw1mt3	660	Sold 3x Water for 660 Eternites	CREDIT	RAW	2026-02-14 08:41:07.206
cmlm2hf9i021zqo01tuypjsdu	cmllu07os007nnw2657lw1mt3	780	Sold 3x Coal for 780 Eternites	CREDIT	RAW	2026-02-14 08:41:07.206
cmlm2hf9j0221qo01a9g3wofd	cmllu07os007nnw2657lw1mt3	5200	Sold 2x Ink for 5200 Eternites	CREDIT	CRAFT	2026-02-14 08:41:07.206
cmlm2jdbk022bqo014owescsq	cmllu00w3006znw26zc4y9ek0	10000	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 08:42:37.999
cmlm2jdbk022dqo013s6hi0lv	cmllu00w3006znw26zc4y9ek0	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 08:42:37.999
cmllzenwl00fxqo014fvamlcg	cmlltzy4f006jnw264h8kyavc	4550	Sold 35x Wood for 4550 Eternites	CREDIT	RAW	2026-02-14 07:14:59.589
cmlm1obck01otqo017gjsdua1	cmllu0jsw008pnw26umu3i0fj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:18:29.108
cmlm1ohyw01p5qo01tqerlk4d	cmllu095j007vnw26ikcqk5fx	1500	Thunt reward: 1500 Eternities	CREDIT	ETERNITES	2026-02-14 08:18:37.688
cmlm1ok2j01p7qo01ixwzno6f	cmllu06j7007hnw26uw0sp36v	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:18:40.411
cmlm1orv401p9qo01572ubs58	cmllu095j007vnw26ikcqk5fx	2560	Bulk Purchase: 7x Water, 4x Coal. (Items Cost: 2560 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:18:50.513
cmlm1orv601pbqo01gn5i89q8	cmllu095j007vnw26ikcqk5fx	11	Acquired: 7x Water, 4x Coal	CREDIT	RAW	2026-02-14 08:18:50.514
cmlm1ox9601pdqo01ja5t8dz1	cmlltzwho006bnw2675cqbryr	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:18:57.498
cmlm1qnub01qnqo01jiv3z339	cmlltzvq60067nw26qemjfwxj	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:20:18.608
cmlm1qs2w01qpqo01zwfclo1c	cmllu0bxd0083nw26cle9wtdh	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:20:24.019
cmlm1qt3801qrqo01xkhr8dyu	cmllu0h0u008fnw2603crdwbl	4200	Bulk Purchase: 21x Water. (Items Cost: 4200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:20:25.413
cmlm1qt5s01qtqo01tvg97spy	cmllu0h0u008fnw2603crdwbl	21	Acquired: 21x Water	CREDIT	RAW	2026-02-14 08:20:25.505
cmlm2jowd022fqo01l8krir03	cmllu01fk0071nw26rgvf2gft	1750	Sold 5x Metal for 1750 Eternites	CREDIT	RAW	2026-02-14 08:42:53.005
cmlm2kzyp022lqo01oqzav8s5	cmllu0jsw008pnw26umu3i0fj	13420	Sold 61x Water for 13420 Eternites	CREDIT	RAW	2026-02-14 08:43:54.001
cmllzfusr00g3qo016v8lj9ow	cmllu0h0u008fnw2603crdwbl	4550	Sold 35x Wood for 4550 Eternites	CREDIT	RAW	2026-02-14 07:15:55.179
cmllzfuss00g5qo01zmc0az4m	cmllu0h0u008fnw2603crdwbl	1200	Sold 5x Coal for 1200 Eternites	CREDIT	RAW	2026-02-14 07:15:55.179
cmllzfyco00g7qo018v29ndef	cmlltzvq60067nw26qemjfwxj	6225	Sold 15x Metal for 6225 Eternites	CREDIT	RAW	2026-02-14 07:15:59.784
cmllzfzwh00g9qo012y8r586w	cmllu0gh8008dnw26sfpjylw0	5200	Sold 40x Wood for 5200 Eternites	CREDIT	RAW	2026-02-14 07:16:01.793
cmllzfzwh00gbqo01jflb2ab4	cmllu0gh8008dnw26sfpjylw0	3735	Sold 9x Metal for 3735 Eternites	CREDIT	RAW	2026-02-14 07:16:01.793
cmllzgjc500gdqo01nn291z6x	cmllu05wr007fnw263pcca89z	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:16:26.905
cmllzgofi00gpqo01qzg6cs0u	cmllu044s0079nw26frbt1r2i	260	Sold 2x Wood for 260 Eternites	CREDIT	RAW	2026-02-14 07:16:33.582
cmllzh2xv00h1qo01mc3vkzr3	cmlltzy4f006jnw264h8kyavc	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:16:52.388
cmllzh33b00h3qo01d5x4wi80	cmlltzy4f006jnw264h8kyavc	3	Bulk Crafted: 3x Brown Paper	CREDIT	CRAFT	2026-02-14 07:16:52.581
cmllzh33g00h5qo01n0nyliq6	cmlltzy4f006jnw264h8kyavc	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 07:16:52.588
cmllzh36500h7qo01mz2uz3hp	cmlltzy4f006jnw264h8kyavc	15	Consumed 15x Water for crafting	DEBIT	RAW	2026-02-14 07:16:52.685
cmllzhmgo00hlqo01wote0vfm	cmlltzzt8006tnw26kuftz5q9	13460	Bulk Purchase: 74x Wood, 16x Coal. (Items Cost: 13460 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:17:17.689
cmllzhmgq00hnqo01f0k3ih11	cmlltzzt8006tnw26kuftz5q9	90	Acquired: 74x Wood, 16x Coal	CREDIT	RAW	2026-02-14 07:17:17.691
cmllzhpe000hpqo01ienkh7hr	cmllu0ik5008lnw26o95uvsly	1300	Sold 10x Wood for 1300 Eternites	CREDIT	RAW	2026-02-14 07:17:21.48
cmllzhpe000hrqo010v2knfea	cmllu0ik5008lnw26o95uvsly	1245	Sold 3x Metal for 1245 Eternites	CREDIT	RAW	2026-02-14 07:17:21.48
cmllzi1l200htqo01ydx7as6e	cmllu0i3k008jnw26vfsdew9m	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:17:37.284
cmllzigpm00hvqo01fthrftjl	cmlltzzi0006rnw2673ipn4ol	16220	Sold 2 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:17:56.89
cmllzigpm00hxqo01uacocyao	cmlltzzi0006rnw2673ipn4ol	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:17:56.89
cmllziqkx00hzqo01pm8tmp7t	cmllu0dry0085nw26fee82749	12095	Bulk Purchase: 40x Wood, 2x Glass, 16x Coal, 5x Metal. (Items Cost: 12095 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:18:09.682
cmllziqky00i1qo01mfnjta65	cmllu0dry0085nw26fee82749	63	Acquired: 40x Wood, 2x Glass, 16x Coal, 5x Metal	CREDIT	RAW	2026-02-14 07:18:09.683
cmllzj1dz00i3qo01lncik1aj	cmllu0gh8008dnw26sfpjylw0	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:18:23.683
cmllzj45x00i7qo010eo7tlt7	cmllu044s0079nw26frbt1r2i	1310	Bulk Purchase: 2x Water, 4x Coal. (Items Cost: 1310 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:18:27.285
cmllzj46000i9qo01480imuur	cmllu044s0079nw26frbt1r2i	6	Acquired: 2x Water, 4x Coal	CREDIT	RAW	2026-02-14 07:18:27.288
cmllzj7h800ibqo01xlvo06u9	cmllu0l6u008vnw26jnnl3z1k	1000	Thunt reward: 1000 Eternities	CREDIT	ETERNITES	2026-02-14 07:18:31.58
cmllzjft900idqo012yto0kb8	cmllu07dj007lnw261urdgi6e	500	Thunt reward: 500 Eternities	CREDIT	ETERNITES	2026-02-14 07:18:42.329
cmllzjmx000ifqo01m1me0x8k	cmllu06j7007hnw26uw0sp36v	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:18:51.588
cmllzjs8i00ihqo0138b12yoh	cmlltzzi0006rnw2673ipn4ol	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:18:58.482
cmllzjwsz00ijqo0174hrpyxt	cmllu02z70075nw267utb00t1	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:19:04.403
cmllzk39r00ilqo01tz2r92rq	cmllu082g007pnw26i9kqife7	2860	Sold 22x Wood for 2860 Eternites	CREDIT	RAW	2026-02-14 07:19:12.783
cmllzk39r00inqo01qpjfwrya	cmllu082g007pnw26i9kqife7	830	Sold 2x Metal for 830 Eternites	CREDIT	RAW	2026-02-14 07:19:12.783
cmllzk44c00irqo016stf82ze	cmllu004r006vnw263zlbwtzm	525	Bulk Purchase: 3x Water. (Items Cost: 525 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:19:13.884
cmllzk44d00itqo01wetskjg8	cmllu004r006vnw263zlbwtzm	3	Acquired: 3x Water	CREDIT	RAW	2026-02-14 07:19:13.885
cmllzk5z300ixqo01hmwnjkm3	cmllu06wy007jnw26xy0x6dn5	3220	Bulk Purchase: 10x Wood, 8x Coal. (Items Cost: 3220 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:19:16.288
cmllzk5z600izqo01ptqfp0e1	cmllu06wy007jnw26xy0x6dn5	18	Acquired: 10x Wood, 8x Coal	CREDIT	RAW	2026-02-14 07:19:16.29
cmllzk84w00j1qo01lfu0agt7	cmlltzwvk006dnw261evs8qz0	875	Bulk Purchase: 5x Water. (Items Cost: 875 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:19:19.088
cmllzk84x00j3qo01ydvvl1b5	cmlltzwvk006dnw261evs8qz0	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 07:19:19.089
cmllzk9ll00j5qo01tvopb3og	cmllu0i3k008jnw26vfsdew9m	1950	Sold 15x Wood for 1950 Eternites	CREDIT	RAW	2026-02-14 07:19:20.985
cmllzkbgb00j9qo0136vi0j7b	cmllu095j007vnw26ikcqk5fx	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:19:23.388
cmllzkbgd00jbqo019zgssqp3	cmllu095j007vnw26ikcqk5fx	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:19:23.39
cmllzkbix00jdqo01fi638wu7	cmllu095j007vnw26ikcqk5fx	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:19:23.481
cmllzkbiz00jfqo011phthwcg	cmllu095j007vnw26ikcqk5fx	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:19:23.484
cmllzkeuc00jhqo01qim0e0b5	cmllu03le0077nw267n1s0mb6	650	Sold 5x Wood for 650 Eternites	CREDIT	RAW	2026-02-14 07:19:27.691
cmllzkeud00jjqo01iah8ltks	cmllu03le0077nw267n1s0mb6	2075	Sold 5x Metal for 2075 Eternites	CREDIT	RAW	2026-02-14 07:19:27.691
cmllzkohn00jpqo01ixu4oxuu	cmllu07os007nnw2657lw1mt3	8050	Bulk Purchase: 46x Water. (Items Cost: 8050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:19:40.284
cmllzkohp00jrqo016ind8f9o	cmllu07os007nnw2657lw1mt3	46	Acquired: 46x Water	CREDIT	RAW	2026-02-14 07:19:40.285
cmllzkscm00jtqo0176xlbmio	cmllu02a60073nw26f5vv4wcw	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:19:45.285
cmllzkwtk00jvqo010jrzmgsm	cmlltzw6n0069nw266t9ghu5c	1310	Bulk Purchase: 2x Water, 4x Coal. (Items Cost: 1310 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:19:51.08
cmllzkwz600jxqo01ynstcj8w	cmlltzw6n0069nw266t9ghu5c	6	Acquired: 2x Water, 4x Coal	CREDIT	RAW	2026-02-14 07:19:51.283
cmllzkxft00k3qo019knalejr	cmllu02z70075nw267utb00t1	9250	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 07:19:51.581
cmllzkxfu00k5qo01woalg6uw	cmllu02z70075nw267utb00t1	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 07:19:51.581
cmllzl3zz00k7qo01q1250eqn	cmlltzxsz006hnw267qcl5gqp	1300	Sold 10x Wood for 1300 Eternites	CREDIT	RAW	2026-02-14 07:20:00.383
cmllzl59500k9qo01hqp3y18u	cmllu0dry0085nw26fee82749	1300	Sold 10x Wood for 1300 Eternites	CREDIT	RAW	2026-02-14 07:20:02.007
cmllzl6pd00kbqo011oxf4ndk	cmllu0bdv0081nw26gpystvor	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:20:03.889
cmllzl86300kdqo0157tso72c	cmllu06wy007jnw26xy0x6dn5	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:20:05.787
cmllzl86400kfqo01comgqp1v	cmllu06wy007jnw26xy0x6dn5	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 07:20:05.788
cmllzl86500khqo010e5qznlr	cmllu06wy007jnw26xy0x6dn5	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:20:05.789
cmllzl86500kjqo01fbvzpl9e	cmllu06wy007jnw26xy0x6dn5	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 07:20:05.79
cmlm1oc1m01oxqo01dociugxk	cmllu044s0079nw26frbt1r2i	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:18:30.01
cmlm1oc1o01ozqo01inp4ivs5	cmllu044s0079nw26frbt1r2i	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 08:18:30.012
cmlm1oc1q01p1qo01ibum43bx	cmllu044s0079nw26frbt1r2i	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 08:18:30.014
cmlm1oc1r01p3qo01yi3vj9c4	cmllu044s0079nw26frbt1r2i	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 08:18:30.015
cmlm1p5wl01pfqo01a5pupfqs	cmllu0kvl008tnw26fe8h34vp	600	Sold 5x Wood for 600 Eternites	CREDIT	RAW	2026-02-14 08:19:08.709
cmlm1pgbk01pzqo01rn9xvvge	cmllu095j007vnw26ikcqk5fx	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:19:22.208
cmlm1pgbl01q1qo01epceult8	cmllu095j007vnw26ikcqk5fx	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 08:19:22.209
cmlm1pgbm01q3qo017jvpflhi	cmllu095j007vnw26ikcqk5fx	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 08:19:22.21
cmlm1pgbn01q5qo01cf6a44cy	cmllu095j007vnw26ikcqk5fx	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 08:19:22.211
cmlm1pu7s01q9qo01h2r0c0yr	cmllu044s0079nw26frbt1r2i	2500	Sold 1x Ink for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:19:40.216
cmlm1qbkt01qhqo01ipujqa57	cmlltzz1o006pnw26ztynyxv4	4300	Sold 1x Magnifying Glass for 4300 Eternites	CREDIT	CRAFT	2026-02-14 08:20:02.717
cmlm1sk4g01rjqo01jttrvsan	cmlltzxsz006hnw267qcl5gqp	5000	Sold 2x Brown Paper for 5000 Eternites	CREDIT	CRAFT	2026-02-14 08:21:47.103
cmlm2l0th022pqo012oqs2zfg	cmllu0bxd0083nw26cle9wtdh	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:43:55.11
cmlm2l0tj022rqo01pt1v3qwu	cmllu0bxd0083nw26cle9wtdh	8	Bulk Crafted: 3x Brown Paper, 1x Pen, 1x Magnifying Glass, 2x Ink, 1x Dividers	CREDIT	CRAFT	2026-02-14 08:43:55.111
cmlm2l0tj022tqo01ip9wfx3y	cmllu0bxd0083nw26cle9wtdh	65	Consumed 65x Wood for crafting	DEBIT	RAW	2026-02-14 08:43:55.112
cmlm2l0tk022vqo01lcednyd0	cmllu0bxd0083nw26cle9wtdh	29	Consumed 29x Water for crafting	DEBIT	RAW	2026-02-14 08:43:55.112
cmlm2l0tl022xqo01weslnsc6	cmllu0bxd0083nw26cle9wtdh	16	Consumed 16x Coal for crafting	DEBIT	RAW	2026-02-14 08:43:55.113
cmlm2l0tl022zqo01p5j1jxma	cmllu0bxd0083nw26cle9wtdh	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 08:43:55.114
cmlm2l0w00231qo018q4fmyl1	cmllu0bxd0083nw26cle9wtdh	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:43:55.2
cmlm2ohfj023tqo012wix7l4i	cmllu05wr007fnw263pcca89z	125	Sold 1x Wood for 125 Eternites	CREDIT	RAW	2026-02-14 08:46:36.607
cmlm2ohfj023vqo01qptp08vb	cmllu05wr007fnw263pcca89z	2550	Sold 1x Brown Paper for 2550 Eternites	CREDIT	CRAFT	2026-02-14 08:46:36.607
cmllzlg6d00klqo017s0yfk1m	cmllu05ad007dnw26h2vqc9kh	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:20:16.165
cmllzlkl500ktqo01mr2n66ti	cmlltzzi0006rnw2673ipn4ol	14940	Bulk Purchase: 36x Metal. (Items Cost: 14940 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:20:21.882
cmllzlkl700kvqo01tk7q32lt	cmlltzzi0006rnw2673ipn4ol	36	Acquired: 36x Metal	CREDIT	RAW	2026-02-14 07:20:21.883
cmllzlq2r00kxqo01tnxoiwdk	cmllu08dp007rnw26v4dgmp23	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:20:28.995
cmllzlqrc00kzqo01vvef0m14	cmlltzvq60067nw26qemjfwxj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:20:29.88
cmllzlsgn00l1qo010gj782e6	cmllu082g007pnw26i9kqife7	3675	Bulk Purchase: 21x Water. (Items Cost: 3675 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:20:32.087
cmllzlsgo00l3qo01zjtpdee0	cmllu082g007pnw26i9kqife7	21	Acquired: 21x Water	CREDIT	RAW	2026-02-14 07:20:32.088
cmllzltqf00l5qo010s3433ct	cmllu0ofe0099nw26n7luunss	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:20:33.736
cmllzm2sw00ljqo010tu97icn	cmllu03le0077nw267n1s0mb6	1920	Bulk Purchase: 8x Coal. (Items Cost: 1920 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:20:45.488
cmllzm2sx00llqo01p3u7b64n	cmllu03le0077nw267n1s0mb6	8	Acquired: 8x Coal	CREDIT	RAW	2026-02-14 07:20:45.489
cmllzmej600m1qo01aw1j1xux	cmllu0i3k008jnw26vfsdew9m	9625	Bulk Purchase: 55x Water. (Items Cost: 9625 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:21:00.69
cmllzmeom00m3qo01cxda7xqe	cmllu0i3k008jnw26vfsdew9m	55	Acquired: 55x Water	CREDIT	RAW	2026-02-14 07:21:00.887
cmllzmkw600m5qo01as1z3zyc	cmlltzzi0006rnw2673ipn4ol	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:21:08.934
cmllzms4100mdqo01zynhp9vl	cmlltzy4f006jnw264h8kyavc	4370	Bulk Purchase: 14x Water, 8x Coal. (Items Cost: 4370 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:21:18.289
cmllzms4200mfqo01n0pyzxk5	cmlltzy4f006jnw264h8kyavc	22	Acquired: 14x Water, 8x Coal	CREDIT	RAW	2026-02-14 07:21:18.291
cmllzmxii00mjqo013y17xa1s	cmlltzz1o006pnw26ztynyxv4	3375	Bulk Purchase: 10x Wood, 5x Metal. (Items Cost: 3375 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:21:25.291
cmllzmxik00mlqo01kloif3j5	cmlltzz1o006pnw26ztynyxv4	15	Acquired: 10x Wood, 5x Metal	CREDIT	RAW	2026-02-14 07:21:25.292
cmllznebr00mxqo014ds8t8uq	cmllu0j14008nnw269ihx0pxl	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:21:46.991
cmllznj1g00n1qo01rlwimdvs	cmllu0h0u008fnw2603crdwbl	1750	Bulk Purchase: 10x Water. (Items Cost: 1750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:21:53.189
cmllznj1h00n3qo017kb9lva1	cmllu0h0u008fnw2603crdwbl	10	Acquired: 10x Water	CREDIT	RAW	2026-02-14 07:21:53.19
cmlm1p82801phqo01v810vof5	cmllu0i3k008jnw26vfsdew9m	120	Sold 1x Wood for 120 Eternites	CREDIT	RAW	2026-02-14 08:19:11.504
cmlm1p82801pjqo01n7z4s54w	cmllu0i3k008jnw26vfsdew9m	1070	Sold 2x Glass for 1070 Eternites	CREDIT	RAW	2026-02-14 08:19:11.504
cmlm1p82801plqo01hqbjss2t	cmllu0i3k008jnw26vfsdew9m	3950	Sold 10x Metal for 3950 Eternites	CREDIT	RAW	2026-02-14 08:19:11.504
cmlm1pc8g01ppqo01ym339az4	cmlltzz1o006pnw26ztynyxv4	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:19:16.913
cmlm1pcb401prqo01k2h0synj	cmlltzz1o006pnw26ztynyxv4	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:19:17.009
cmlm1pcgj01ptqo01d9b4ezjg	cmlltzz1o006pnw26ztynyxv4	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:19:17.014
cmlm1pcgk01pvqo01p6szasq4	cmlltzz1o006pnw26ztynyxv4	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:19:17.205
cmlm1pcgm01pxqo019m1nitvx	cmlltzz1o006pnw26ztynyxv4	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:19:17.207
cmlm1pzds01qbqo01xhuuxlii	cmllu07os007nnw2657lw1mt3	8690	Sold 22x Metal for 8690 Eternites	CREDIT	RAW	2026-02-14 08:19:46.912
cmlm1tyd201s9qo0166xhh25o	cmllu0bxd0083nw26cle9wtdh	17550	Bought 4 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:22:52.213
cmlm1tyd201sbqo01es9nk37d	cmllu0bxd0083nw26cle9wtdh	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:22:52.213
cmlm1urg201sjqo01grjfpap3	cmllu05ad007dnw26h2vqc9kh	1440	Sold 12x Wood for 1440 Eternites	CREDIT	RAW	2026-02-14 08:23:29.906
cmlm1urg301slqo01z4gq02ud	cmllu05ad007dnw26h2vqc9kh	2370	Sold 6x Metal for 2370 Eternites	CREDIT	RAW	2026-02-14 08:23:29.906
cmlm1uyym01srqo01j3aztdgi	cmllu0mw10093nw26ppcub6u6	7200	Sold 60x Wood for 7200 Eternites	CREDIT	RAW	2026-02-14 08:23:39.646
cmlm2lzm80239qo01hk9pkfxp	cmllu0ik5008lnw26o95uvsly	440	Sold 2x Water for 440 Eternites	CREDIT	RAW	2026-02-14 08:44:40.208
cmllzlji800knqo01644q8nvw	cmllu095j007vnw26ikcqk5fx	2100	Sold 1x Brown Paper for 2100 Eternites	CREDIT	CRAFT	2026-02-14 07:20:20.48
cmllzljtl00kpqo0125x2slq4	cmllu0mw10093nw26ppcub6u6	6760	Sold 52x Wood for 6760 Eternites	CREDIT	RAW	2026-02-14 07:20:20.889
cmllzljtm00krqo01qepbg84b	cmllu0mw10093nw26ppcub6u6	830	Sold 2x Metal for 830 Eternites	CREDIT	RAW	2026-02-14 07:20:20.889
cmllzm21000l9qo01ra1d5062	cmlltzw6n0069nw266t9ghu5c	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:20:44.484
cmllzm21100lbqo01z0tmfx1g	cmlltzw6n0069nw266t9ghu5c	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 07:20:44.485
cmllzm21200ldqo01by74wdnj	cmlltzw6n0069nw266t9ghu5c	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 07:20:44.486
cmllzm21300lfqo016zln3tzo	cmlltzw6n0069nw266t9ghu5c	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 07:20:44.487
cmllzm9a700lnqo015r99jdbc	cmllu0dry0085nw26fee82749	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:20:53.888
cmllzm9a800lpqo015spxw3me	cmllu0dry0085nw26fee82749	3	Bulk Crafted: 2x Pen, 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 07:20:53.889
cmllzm9cs00lrqo0156tavuvi	cmllu0dry0085nw26fee82749	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 07:20:53.981
cmllzm9d300ltqo01tqxuzxiy	cmllu0dry0085nw26fee82749	16	Consumed 16x Coal for crafting	DEBIT	RAW	2026-02-14 07:20:53.991
cmllzm9d400lvqo01yp7g25aj	cmllu0dry0085nw26fee82749	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 07:20:53.993
cmllzm9d600lxqo01wfg2aqgl	cmllu0dry0085nw26fee82749	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 07:20:53.994
cmllzmosc00m7qo01g2etwx7x	cmlltzzi0006rnw2673ipn4ol	21600	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:21:13.884
cmllzmosc00m9qo01lm1jjhii	cmlltzzi0006rnw2673ipn4ol	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:21:13.884
cmllzn1da00mpqo01n6od7whf	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:21:30.286
cmllzn1dd00mrqo011ufr14k9	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 07:21:30.289
cmllzn1de00mtqo0110zreldx	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:21:30.291
cmllzn1dg00mvqo01e20q5omd	cmllu03le0077nw267n1s0mb6	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 07:21:30.292
cmllznnw700n5qo01522shmln	cmlltzw6n0069nw266t9ghu5c	2000	Sold 1x Ink for 2000 Eternites	CREDIT	CRAFT	2026-02-14 07:21:59.448
cmllznoo500n7qo01cy1vmaun	cmllu03le0077nw267n1s0mb6	3000	Sold 1x Pen for 3000 Eternites	CREDIT	CRAFT	2026-02-14 07:22:00.486
cmllznsj000n9qo01o3rff518	cmllu0kvl008tnw26fe8h34vp	-900000	Converted 900000 USD to IDR	DEBIT	USD	2026-02-14 07:22:05.395
cmllznsj000nbqo015t81utqa	cmllu0kvl008tnw26fe8h34vp	14965200000	Received 14965200000 IDR from USD	CREDIT	IDR	2026-02-14 07:22:05.395
cmllzo2pk00nfqo01pai0xd3b	cmlltzz1o006pnw26ztynyxv4	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:22:18.68
cmllzo2pn00nhqo01845f0qe3	cmlltzz1o006pnw26ztynyxv4	1	Bulk Crafted: 1x Dividers	CREDIT	CRAFT	2026-02-14 07:22:18.683
cmllzo2po00njqo01ymi1n2d9	cmlltzz1o006pnw26ztynyxv4	15	Consumed 15x Wood for crafting	DEBIT	RAW	2026-02-14 07:22:18.684
cmllzo2pp00nlqo01hfgqiwjz	cmlltzz1o006pnw26ztynyxv4	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 07:22:18.686
cmllzocqw00npqo01hdhc48uv	cmllu02a60073nw26f5vv4wcw	2975	Bulk Purchase: 17x Water. (Items Cost: 2975 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:22:31.689
cmllzocqx00nrqo01zrqgsipc	cmllu02a60073nw26f5vv4wcw	17	Acquired: 17x Water	CREDIT	RAW	2026-02-14 07:22:31.69
cmllzoo6100ntqo0119wkoreb	cmllu07dj007lnw261urdgi6e	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:22:46.489
cmllzop6100nvqo01qy2b3vj3	cmllu0jsw008pnw26umu3i0fj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:22:47.784
cmllzopuy00o1qo016nlqkynn	cmllu0l6u008vnw26jnnl3z1k	7105	Bulk Purchase: 2x Glass, 35x Water. (Items Cost: 7105 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:22:48.683
cmllzopv000o3qo01souvfbe8	cmllu0l6u008vnw26jnnl3z1k	37	Acquired: 2x Glass, 35x Water	CREDIT	RAW	2026-02-14 07:22:48.684
cmllzoxvw00o5qo01fhoc3rgk	cmllu03le0077nw267n1s0mb6	3220	Bulk Purchase: 10x Wood, 8x Coal. (Items Cost: 3220 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:22:59.084
cmllzoxvx00o7qo01k9tory1v	cmllu03le0077nw267n1s0mb6	18	Acquired: 10x Wood, 8x Coal	CREDIT	RAW	2026-02-14 07:22:59.086
cmllzp0tf00o9qo01s35pgw8r	cmlltzz1o006pnw26ztynyxv4	4100	Sold 1x Dividers for 4100 Eternites	CREDIT	CRAFT	2026-02-14 07:23:02.883
cmllzp1fr00obqo01odzj8p1b	cmllu0ep90087nw26uyzbvykl	-2050000	Converted 2050000 USD to IDR	DEBIT	USD	2026-02-14 07:23:03.683
cmllzp1fr00odqo01t1uzgbfp	cmllu0ep90087nw26uyzbvykl	34087400000	Received 34087400000 IDR from USD	CREDIT	IDR	2026-02-14 07:23:03.683
cmllzp8rh00ofqo01izkztz3p	cmlltzvq60067nw26qemjfwxj	7175	Bulk Purchase: 41x Water. (Items Cost: 7175 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:23:13.181
cmllzp8rl00ohqo01p52tqzc6	cmlltzvq60067nw26qemjfwxj	41	Acquired: 41x Water	CREDIT	RAW	2026-02-14 07:23:13.186
cmllzpc0500ojqo01ipdwfotu	cmllu0bxd0083nw26cle9wtdh	1950	Sold 15x Wood for 1950 Eternites	CREDIT	RAW	2026-02-14 07:23:17.381
cmllzpcmv00olqo01l797iuoe	cmlltzy4f006jnw264h8kyavc	1920	Sold 8x Coal for 1920 Eternites	CREDIT	RAW	2026-02-14 07:23:18.199
cmllzppl100onqo01jpk93r21	cmlltzzi0006rnw2673ipn4ol	19890	Bulk Purchase: 153x Wood. (Items Cost: 19890 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:23:34.981
cmllzppl200opqo01gplmy90b	cmlltzzi0006rnw2673ipn4ol	153	Acquired: 153x Wood	CREDIT	RAW	2026-02-14 07:23:34.983
cmllzpu5000orqo01tgi6ap88	cmllu0h0u008fnw2603crdwbl	2100	Bulk Purchase: 12x Water. (Items Cost: 2100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:23:40.885
cmllzpu5200otqo013j08zxvx	cmllu0h0u008fnw2603crdwbl	12	Acquired: 12x Water	CREDIT	RAW	2026-02-14 07:23:40.886
cmllzq3bi00ovqo01xpwr10pq	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:23:52.782
cmllzq3bj00oxqo01bdnlwyyv	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 07:23:52.783
cmllzq3bj00ozqo015enoegvh	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:23:52.784
cmllzq3bk00p1qo018roj8nht	cmllu03le0077nw267n1s0mb6	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 07:23:52.784
cmllzq61000p7qo01oa8o3e4o	cmllu06j7007hnw26uw0sp36v	2425	Bulk Purchase: 7x Water, 5x Coal. (Items Cost: 2425 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:23:56.292
cmllzq61000p9qo01sfd51x4r	cmllu06j7007hnw26uw0sp36v	12	Acquired: 7x Water, 5x Coal	CREDIT	RAW	2026-02-14 07:23:56.293
cmllzqhiy00pbqo014lczb83t	cmllu0h0u008fnw2603crdwbl	3500	Bulk Purchase: 20x Water. (Items Cost: 3500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:24:11.195
cmllzqhiz00pdqo01mnhkifhn	cmllu0h0u008fnw2603crdwbl	20	Acquired: 20x Water	CREDIT	RAW	2026-02-14 07:24:11.196
cmllzqklv00pfqo01ja5vn8fp	cmlltzyhy006lnw26tbnvyy6x	4150	Sold 10x Metal for 4150 Eternites	CREDIT	RAW	2026-02-14 07:24:15.187
cmllzqmb100phqo015t1bop9k	cmlltzzi0006rnw2673ipn4ol	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:24:17.389
cmllzqohb00pjqo01ggkh52hh	cmlltzzt8006tnw26kuftz5q9	2600	Sold 20x Wood for 2600 Eternites	CREDIT	RAW	2026-02-14 07:24:20.208
cmllzqs3c00plqo01eaeuzub9	cmlltzz1o006pnw26ztynyxv4	4025	Bulk Purchase: 15x Wood, 5x Metal. (Items Cost: 4025 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:24:24.889
cmllzqs3e00pnqo01n81062zq	cmlltzz1o006pnw26ztynyxv4	20	Acquired: 15x Wood, 5x Metal	CREDIT	RAW	2026-02-14 07:24:24.89
cmllzr2fi00prqo01ve80eoqo	cmllu0h0u008fnw2603crdwbl	1750	Bulk Purchase: 10x Water. (Items Cost: 1750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:24:38.287
cmllzr2kw00pvqo015fffdam7	cmllu0h0u008fnw2603crdwbl	10	Acquired: 10x Water	CREDIT	RAW	2026-02-14 07:24:38.48
cmlm1ppyt01q7qo01rn044r7z	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:19:34.709
cmlm1q7n001qdqo018r87r6qk	cmllu00w3006znw26zc4y9ek0	4400	Bulk Purchase: 20x Wood, 10x Water. (Items Cost: 4400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:19:57.613
cmlm1q7n101qfqo015lvc5gyj	cmllu00w3006znw26zc4y9ek0	30	Acquired: 20x Wood, 10x Water	CREDIT	RAW	2026-02-14 08:19:57.614
cmlm1qbkt01qjqo01gm88mwhv	cmllu08or007tnw26wd6mv6wd	6400	Bulk Purchase: 32x Water. (Items Cost: 6400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:20:02.718
cmlm1qbn901qlqo01yyernelb	cmllu08or007tnw26wd6mv6wd	32	Acquired: 32x Water	CREDIT	RAW	2026-02-14 08:20:02.806
cmlm1s6jq01r9qo01mrug1bqn	cmllu0gh8008dnw26sfpjylw0	1200	Bulk Purchase: 10x Wood. (Items Cost: 1200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:21:29.511
cmlm1s6jr01rbqo01f9xelm3u	cmllu0gh8008dnw26sfpjylw0	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:21:29.512
cmlm1sxjy01rlqo01a0raxdrl	cmllu00kw006xnw261mwscl7e	4400	Bulk Purchase: 20x Wood, 10x Water. (Items Cost: 4400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:22:04.51
cmlm1sxjz01rnqo01isiwbr9f	cmllu00kw006xnw261mwscl7e	30	Acquired: 20x Wood, 10x Water	CREDIT	RAW	2026-02-14 08:22:04.511
cmlm1t9lc01rpqo019dzpmj9s	cmllu07os007nnw2657lw1mt3	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:22:20.112
cmlm1tbcy01rrqo010obsgyrp	cmllu0dry0085nw26fee82749	8800	Bulk Purchase: 40x Wood, 20x Water. (Items Cost: 8800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:22:22.402
cmlm1tbd001rtqo01esw3vson	cmllu0dry0085nw26fee82749	60	Acquired: 40x Wood, 20x Water	CREDIT	RAW	2026-02-14 08:22:22.404
cmlm1tk8l01rvqo01kapon82o	cmllu0l6u008vnw26jnnl3z1k	11600	Bulk Purchase: 58x Water. (Items Cost: 11600 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:22:33.909
cmlm1tk8m01rxqo01i5k02hp8	cmllu0l6u008vnw26jnnl3z1k	58	Acquired: 58x Water	CREDIT	RAW	2026-02-14 08:22:33.911
cmlm1tlmp01rzqo01gpu2npnf	cmllu06j7007hnw26uw0sp36v	5800	Bulk Purchase: 29x Water. (Items Cost: 5800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:22:35.714
cmlm1tlmq01s1qo01um6chiw7	cmllu06j7007hnw26uw0sp36v	29	Acquired: 29x Water	CREDIT	RAW	2026-02-14 08:22:35.715
cmlm1tnu001s3qo01js9vqjd4	cmllu0hmt008hnw26efktlnfg	38800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:22:38.568
cmlm1tu6s01s5qo010jte52uw	cmllu0i3k008jnw26vfsdew9m	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:22:46.803
cmlm1tytq01sdqo012ctamge3	cmllu06j7007hnw26uw0sp36v	2000	Bulk Purchase: 10x Water. (Items Cost: 2000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:22:52.814
cmlm1tyw601sfqo012qnqs40t	cmllu06j7007hnw26uw0sp36v	10	Acquired: 10x Water	CREDIT	RAW	2026-02-14 08:22:52.903
cmlm1u4bi01shqo01mq2n62dk	cmllu03le0077nw267n1s0mb6	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:22:59.934
cmlm1uy3201snqo01uvy76rgc	cmllu02a60073nw26f5vv4wcw	1070	Bulk Purchase: 2x Glass. (Items Cost: 1070 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:23:38.511
cmlm1uy5n01spqo01ci4pgors	cmllu02a60073nw26f5vv4wcw	2	Acquired: 2x Glass	CREDIT	RAW	2026-02-14 08:23:38.603
cmlm1vg0i01stqo01ui2hq2bj	cmllu0dry0085nw26fee82749	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:24:01.747
cmlm1vqh601tdqo01ih19dhn0	cmlltzz1o006pnw26ztynyxv4	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:24:15.305
cmlm2m0gk023bqo01n6jr9kgl	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:44:41.3
cmlm2m0gm023dqo01eh07mswx	cmllu00w3006znw26zc4y9ek0	3	Bulk Crafted: 3x Brown Paper	CREDIT	CRAFT	2026-02-14 08:44:41.302
cmlm2m0gn023fqo01vi83peii	cmllu00w3006znw26zc4y9ek0	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 08:44:41.304
cmlm2m0go023hqo017bofh6wu	cmllu00w3006znw26zc4y9ek0	15	Consumed 15x Water for crafting	DEBIT	RAW	2026-02-14 08:44:41.305
cmllzqsha00ppqo01391lvlhe	cmllu03le0077nw267n1s0mb6	3000	Sold 1x Pen for 3000 Eternites	CREDIT	CRAFT	2026-02-14 07:24:25.389
cmllzr64v00pzqo01gk4mem25	cmllu0i3k008jnw26vfsdew9m	490	Sold 1x Glass for 490 Eternites	CREDIT	RAW	2026-02-14 07:24:43.087
cmllzrbrl00q3qo01mh9h32xw	cmllu06j7007hnw26uw0sp36v	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:24:50.386
cmllzrbrm00q5qo01aee6b4zt	cmllu06j7007hnw26uw0sp36v	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 07:24:50.387
cmllzrbrn00q7qo01axhxz0fv	cmllu06j7007hnw26uw0sp36v	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 07:24:50.387
cmllzrbro00q9qo01pqv2hrwc	cmllu06j7007hnw26uw0sp36v	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 07:24:50.388
cmlm1vgdf01svqo014yfetumr	cmllu0bxd0083nw26cle9wtdh	3400	Sold 17x Water for 3400 Eternites	CREDIT	RAW	2026-02-14 08:24:02.21
cmlm1vgdf01sxqo01uh94wy7c	cmllu0bxd0083nw26cle9wtdh	5000	Sold 2x Brown Paper for 5000 Eternites	CREDIT	CRAFT	2026-02-14 08:24:02.21
cmlm1vgdf01szqo01urrgi2la	cmllu0bxd0083nw26cle9wtdh	8600	Sold 2x Magnifying Glass for 8600 Eternites	CREDIT	CRAFT	2026-02-14 08:24:02.21
cmlm1vgdf01t1qo01tn87uykr	cmllu0bxd0083nw26cle9wtdh	7600	Sold 2x Dividers for 7600 Eternites	CREDIT	CRAFT	2026-02-14 08:24:02.21
cmlm2nit3023lqo0124l04faa	cmllu04r7007bnw26zxtj1wy7	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 08:45:51.735
cmlm2nlmz023nqo016mgbr3ia	cmllu00w3006znw26zc4y9ek0	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:45:55.402
cmllzr2fo00ptqo01wyp1tz6k	cmlltzy4f006jnw264h8kyavc	2275	Bulk Purchase: 13x Water. (Items Cost: 2275 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:24:38.289
cmllzr2kx00pxqo01bja59n1o	cmlltzy4f006jnw264h8kyavc	13	Acquired: 13x Water	CREDIT	RAW	2026-02-14 07:24:38.481
cmllzripm00qbqo013so5a56y	cmllu0h0u008fnw2603crdwbl	350	Bulk Purchase: 2x Water. (Items Cost: 350 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:24:59.386
cmllzripp00qdqo016orzk207	cmllu0h0u008fnw2603crdwbl	2	Acquired: 2x Water	CREDIT	RAW	2026-02-14 07:24:59.389
cmllzrjk800qhqo01mls24hfp	cmllu02a60073nw26f5vv4wcw	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:25:00.488
cmllzrjmr00qjqo01n4570ikm	cmllu02a60073nw26f5vv4wcw	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 07:25:00.58
cmllzrjmw00qlqo019x4ux84f	cmllu02a60073nw26f5vv4wcw	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 07:25:00.584
cmllzrjmz00qnqo0174f48leb	cmllu02a60073nw26f5vv4wcw	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 07:25:00.588
cmllzrv7l00qpqo01c2nf179z	cmlltzz1o006pnw26ztynyxv4	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:25:15.585
cmllzrvab00qrqo01gedo1wp5	cmlltzz1o006pnw26ztynyxv4	1	Bulk Crafted: 1x Dividers	CREDIT	CRAFT	2026-02-14 07:25:15.683
cmllzrvad00qtqo01mznztbp0	cmlltzz1o006pnw26ztynyxv4	15	Consumed 15x Wood for crafting	DEBIT	RAW	2026-02-14 07:25:15.685
cmllzrvad00qvqo01c9re8ksp	cmlltzz1o006pnw26ztynyxv4	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 07:25:15.686
cmllzrwwp00qxqo01fkxq9rdm	cmllu07dj007lnw261urdgi6e	2200	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:25:17.689
cmllzrwwp00qzqo01bkqhl0co	cmllu07dj007lnw261urdgi6e	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:25:17.689
cmllzs6mn00r1qo019w1slf2k	cmllu0jsw008pnw26umu3i0fj	3120	Sold 24x Wood for 3120 Eternites	CREDIT	RAW	2026-02-14 07:25:30.185
cmllzs6mq00r3qo01m0jyff1a	cmllu0jsw008pnw26umu3i0fj	4565	Sold 11x Metal for 4565 Eternites	CREDIT	RAW	2026-02-14 07:25:30.185
cmllzs6ph00r5qo01ytlwi35u	cmllu0bxd0083nw26cle9wtdh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:25:30.185
cmllzsi7g00r7qo01x3iqarf2	cmllu0ik5008lnw26o95uvsly	490	Bulk Purchase: 1x Glass. (Items Cost: 490 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:25:45.388
cmllzsi7j00r9qo01ayxfav4p	cmllu0ik5008lnw26o95uvsly	1	Acquired: 1x Glass	CREDIT	RAW	2026-02-14 07:25:45.392
cmllzss2z00rdqo01sdcgzt8c	cmllu0j14008nnw269ihx0pxl	8700	Bulk Purchase: 40x Wood, 20x Water. (Items Cost: 8700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:25:58.188
cmllzss3000rfqo01ujf02dgd	cmllu0j14008nnw269ihx0pxl	60	Acquired: 40x Wood, 20x Water	CREDIT	RAW	2026-02-14 07:25:58.189
cmllzt3yq00rjqo01yy486ggh	cmlltzzt8006tnw26kuftz5q9	2625	Bulk Purchase: 15x Water. (Items Cost: 2625 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:26:13.587
cmllzt3ys00rlqo01pz8f5s50	cmlltzzt8006tnw26kuftz5q9	15	Acquired: 15x Water	CREDIT	RAW	2026-02-14 07:26:13.589
cmllzt6a400rnqo01o79cpzx0	cmlltzzi0006rnw2673ipn4ol	33660	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:26:16.587
cmllzt6a400rpqo01g3drvdcl	cmlltzzi0006rnw2673ipn4ol	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:26:16.587
cmllztb2c00rrqo0165n96hr3	cmlltzyqo006nnw26bdi47ek8	2450	Bulk Purchase: 5x Glass. (Items Cost: 2450 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:26:22.788
cmllztb4x00rtqo01s046te49	cmlltzyqo006nnw26bdi47ek8	5	Acquired: 5x Glass	CREDIT	RAW	2026-02-14 07:26:22.881
cmllztn4f00rxqo01g88g7fxq	cmllu0mw10093nw26ppcub6u6	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:26:38.415
cmllztsys00s1qo01rckheqcm	cmllu04r7007bnw26zxtj1wy7	1440	Bulk Purchase: 6x Coal. (Items Cost: 1440 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:26:45.989
cmllztsyt00s3qo01lyq6i05a	cmllu04r7007bnw26zxtj1wy7	6	Acquired: 6x Coal	CREDIT	RAW	2026-02-14 07:26:45.99
cmllztvnu00s7qo01u4qthdhy	cmllu05ad007dnw26h2vqc9kh	2000	Thunt reward: 2000 Eternities	CREDIT	ETERNITES	2026-02-14 07:26:49.48
cmllzu8nn00s9qo0125zv12o9	cmllu0ofe0099nw26n7luunss	1000	Thunt reward: 1000 Eternities	CREDIT	ETERNITES	2026-02-14 07:27:06.323
cmllzugf300sbqo01o154pom2	cmllu0bdv0081nw26gpystvor	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 07:27:16.382
cmllzv51c00sdqo01970ccs02	cmlltzzt8006tnw26kuftz5q9	1440	Sold 6x Coal for 1440 Eternites	CREDIT	RAW	2026-02-14 07:27:48.288
cmllzve2d00sfqo01s3vp0y3f	cmllu0jsw008pnw26umu3i0fj	7875	Bulk Purchase: 45x Water. (Items Cost: 7875 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:27:59.989
cmllzve2d00shqo015s3vcsi7	cmllu0jsw008pnw26umu3i0fj	45	Acquired: 45x Water	CREDIT	RAW	2026-02-14 07:27:59.99
cmllzvidw00slqo01vf90fuf2	cmllu095j007vnw26ikcqk5fx	1940	Bulk Purchase: 2x Glass, 4x Coal. (Items Cost: 1940 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:28:05.589
cmllzvimd00snqo014deelxot	cmllu095j007vnw26ikcqk5fx	6	Acquired: 2x Glass, 4x Coal	CREDIT	RAW	2026-02-14 07:28:05.894
cmllzvl0900spqo01t9q82knq	cmllu06j7007hnw26uw0sp36v	240	Sold 1x Coal for 240 Eternites	CREDIT	RAW	2026-02-14 07:28:08.981
cmllzvl0900srqo01nfqvz67n	cmllu06j7007hnw26uw0sp36v	2000	Sold 1x Ink for 2000 Eternites	CREDIT	CRAFT	2026-02-14 07:28:08.981
cmllzvlrw00stqo01679knosy	cmllu0bxd0083nw26cle9wtdh	2600	Sold 20x Wood for 2600 Eternites	CREDIT	RAW	2026-02-14 07:28:09.887
cmllzvlrx00svqo01xz7ja5p1	cmllu0bxd0083nw26cle9wtdh	2880	Sold 12x Coal for 2880 Eternites	CREDIT	RAW	2026-02-14 07:28:09.887
cmllzvlrx00sxqo01a00xt2wk	cmllu0bxd0083nw26cle9wtdh	2075	Sold 5x Metal for 2075 Eternites	CREDIT	RAW	2026-02-14 07:28:09.887
cmllzvp0t00szqo01ud07howq	cmllu0mw10093nw26ppcub6u6	4400	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:28:14.189
cmllzvp0t00t1qo01zd6sruy5	cmllu0mw10093nw26ppcub6u6	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:28:14.189
cmllzw2ac00t3qo01chxzowpg	cmllu08dp007rnw26v4dgmp23	36400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:28:31.38
cmllzw42c00t5qo01816740ev	cmlltzzt8006tnw26kuftz5q9	1430	Bulk Purchase: 11x Wood. (Items Cost: 1430 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:28:33.685
cmllzw42d00t7qo01l2e4uevz	cmlltzzt8006tnw26kuftz5q9	11	Acquired: 11x Wood	CREDIT	RAW	2026-02-14 07:28:33.686
cmllzx20p00t9qo0145djj1yz	cmllu05ad007dnw26h2vqc9kh	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:29:17.688
cmllzx43p00tbqo018yab214i	cmllu0gh8008dnw26sfpjylw0	3400000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 07:29:20.389
cmllzx4hk00tdqo01l32campc	cmllu0ep90087nw26uyzbvykl	-2050000	Converted 2050000 USD to IDR	DEBIT	USD	2026-02-14 07:29:20.888
cmllzx4k600tfqo01smdhz3nw	cmllu0ep90087nw26uyzbvykl	34087400000	Received 34087400000 IDR from USD	CREDIT	IDR	2026-02-14 07:29:20.888
cmllzxmjh00thqo01pxdxo3ru	cmllu08dp007rnw26v4dgmp23	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:29:44.285
cmllzxnp600tlqo01qxsyg083	cmllu0bdv0081nw26gpystvor	2795	Bulk Purchase: 5x Water, 8x Coal. (Items Cost: 2795 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:29:45.787
cmllzxnp800tnqo01hx7m41r1	cmllu0bdv0081nw26gpystvor	13	Acquired: 5x Water, 8x Coal	CREDIT	RAW	2026-02-14 07:29:45.788
cmllzyfuq00tpqo01md9l63oc	cmlltzwho006bnw2675cqbryr	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:30:22.275
cmllzypdr00trqo012lyzz4yr	cmlltzw6n0069nw266t9ghu5c	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:30:34.623
cmllzyso700ttqo01n17bohtn	cmllu0h0u008fnw2603crdwbl	430	Sold 2x Water for 430 Eternites	CREDIT	RAW	2026-02-14 07:30:38.887
cmllzzty000tzqo01329yg27p	cmlltzvq60067nw26qemjfwxj	12040	Sold 56x Water for 12040 Eternites	CREDIT	RAW	2026-02-14 07:31:27.192
cmlm1vq3401t3qo0138iotz2z	cmllu02a60073nw26f5vv4wcw	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:24:14.801
cmlm1vq3901t5qo01ebcrldn8	cmllu02a60073nw26f5vv4wcw	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:24:14.805
cmlm1vq8t01t7qo016y154ggr	cmllu02a60073nw26f5vv4wcw	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:24:15.005
cmlm1vq8x01t9qo01d4g1swt6	cmllu02a60073nw26f5vv4wcw	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:24:15.009
cmlm1vqbi01tbqo01ihsavwqo	cmllu02a60073nw26f5vv4wcw	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:24:15.103
cmlm2nokg023pqo01ms00io3w	cmlltzy4f006jnw264h8kyavc	46000000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:45:59.105
cmlm2nynb023rqo01a2dc4t0g	cmlltzvq60067nw26qemjfwxj	2000	Thunt reward: 2000 Eternities	CREDIT	ETERNITES	2026-02-14 08:46:12.263
cmlm2s1za0245qo01b617nd3l	cmllu0bxd0083nw26cle9wtdh	2350	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2350 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:49:23.207
cmlm2s1zg0247qo01vdhoy4eq	cmllu0bxd0083nw26cle9wtdh	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 08:49:23.212
cmllzz9eu00tvqo015qmx7806	cmllu01fk0071nw26rgvf2gft	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:31:00.583
cmllzzxke00u3qo01lvrtf83d	cmllu08dp007rnw26v4dgmp23	1900	Bulk Purchase: 5x Metal. (Items Cost: 1900 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:31:31.886
cmllzzxkf00u5qo01r2w1ck9w	cmllu08dp007rnw26v4dgmp23	5	Acquired: 5x Metal	CREDIT	RAW	2026-02-14 07:31:31.888
cmlm000ek00u7qo016gxshdp7	cmllu0bxd0083nw26cle9wtdh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:31:35.564
cmlm00aap00unqo01a363tsas	cmllu0hmt008hnw26efktlnfg	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:31:48.385
cmlm00mna00urqo01xdku5aq5	cmllu0ofe0099nw26n7luunss	24400000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:32:04.39
cmlm00sth00uvqo01qccl9vqu	cmllu0i3k008jnw26vfsdew9m	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:32:12.389
cmlm012wn00uxqo01xvoakt8a	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:32:25.463
cmlm1vrmt01tfqo01pfxow92d	cmllu04r7007bnw26zxtj1wy7	1185	Sold 3x Metal for 1185 Eternites	CREDIT	RAW	2026-02-14 08:24:16.805
cmlm2p9d5023xqo01mhtamze9	cmllu04r7007bnw26zxtj1wy7	6300	Sold 18x Metal for 6300 Eternites	CREDIT	RAW	2026-02-14 08:47:12.809
cmlm2sfsc0249qo01j4tuorqf	cmllu02a60073nw26f5vv4wcw	1540	Sold 7x Water for 1540 Eternites	CREDIT	RAW	2026-02-14 08:49:41.1
cmlm2sfsc024bqo011wfm8gt6	cmllu02a60073nw26f5vv4wcw	5100	Sold 2x Brown Paper for 5100 Eternites	CREDIT	CRAFT	2026-02-14 08:49:41.1
cmlm2sfsc024dqo01ym7m2adz	cmllu02a60073nw26f5vv4wcw	4000	Sold 1x Magnifying Glass for 4000 Eternites	CREDIT	CRAFT	2026-02-14 08:49:41.1
cmllzze9z00txqo0152qrg9ue	cmllu0i3k008jnw26vfsdew9m	11825	Sold 55x Water for 11825 Eternites	CREDIT	RAW	2026-02-14 07:31:06.887
cmlm0021m00u9qo01m5xv40h7	cmllu05wr007fnw263pcca89z	4400	Sold 2x Brown Paper for 4400 Eternites	CREDIT	CRAFT	2026-02-14 07:31:37.689
cmlm004l800udqo01yc6zm9yr	cmllu0bdv0081nw26gpystvor	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:31:40.985
cmlm004la00ufqo011jaxus6t	cmllu0bdv0081nw26gpystvor	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 07:31:40.991
cmlm004le00uhqo01xxef5m81	cmllu0bdv0081nw26gpystvor	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 07:31:40.994
cmlm004lf00ujqo01hrd8k5y5	cmllu0bdv0081nw26gpystvor	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 07:31:40.995
cmlm005th00ulqo01tf7ysjs9	cmllu0jsw008pnw26umu3i0fj	430	Sold 2x Water for 430 Eternites	CREDIT	RAW	2026-02-14 07:31:42.581
cmlm00ert00upqo01pc7v78im	cmlltzwvk006dnw261evs8qz0	1290	Sold 6x Water for 1290 Eternites	CREDIT	RAW	2026-02-14 07:31:54.186
cmlm00sfm00utqo01j0n143fe	cmlltzy4f006jnw264h8kyavc	2795	Sold 13x Water for 2795 Eternites	CREDIT	RAW	2026-02-14 07:32:11.891
cmlm01e6p00uzqo0126mx3o3b	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:32:39.993
cmlm01g9r00v1qo01fjk2l98v	cmllu004r006vnw263zlbwtzm	645	Sold 3x Water for 645 Eternites	CREDIT	RAW	2026-02-14 07:32:42.783
cmlm01mof00v3qo01xchc5on2	cmlltzz1o006pnw26ztynyxv4	3950	Sold 1x Dividers for 3950 Eternites	CREDIT	CRAFT	2026-02-14 07:32:51.087
cmlm021bq00v5qo01mf26rsoh	cmllu08or007tnw26wd6mv6wd	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:33:10.07
cmlm022sx00v7qo011g5urcar	cmllu03le0077nw267n1s0mb6	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:33:11.985
cmlm02g0s00v9qo01skaw1i6v	cmllu0bxd0083nw26cle9wtdh	2580	Sold 12x Water for 2580 Eternites	CREDIT	RAW	2026-02-14 07:33:29.116
cmlm02pmg00vbqo01za6muevo	cmlltzyqo006nnw26bdi47ek8	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:33:41.56
cmlm02r9h00vdqo017f04qvxb	cmllu00kw006xnw261mwscl7e	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:33:43.685
cmlm030wt00vfqo018t7llh3m	cmllu0fek0089nw26lw6emt67	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:33:56.19
cmlm037xv00vhqo01pu2fi3yx	cmllu09jj007xnw26irsp7nwv	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:34:05.299
cmlm03r8000vlqo01pextmy0p	cmllu0i3k008jnw26vfsdew9m	11970	Bulk Purchase: 1x Glass, 50x Coal. (Items Cost: 11970 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:34:30.288
cmlm03r8000vnqo01tkm9oid6	cmllu0i3k008jnw26vfsdew9m	51	Acquired: 1x Glass, 50x Coal	CREDIT	RAW	2026-02-14 07:34:30.289
cmlm03vuk00vpqo01aw0h21bh	cmllu0j14008nnw269ihx0pxl	1150	Sold 10x Wood for 1150 Eternites	CREDIT	RAW	2026-02-14 07:34:36.284
cmlm03vuk00vrqo01fq9wbx7i	cmllu0j14008nnw269ihx0pxl	1075	Sold 5x Water for 1075 Eternites	CREDIT	RAW	2026-02-14 07:34:36.284
cmlm04etx00vtqo01d7f49cq8	cmlltzy4f006jnw264h8kyavc	1840	Bulk Purchase: 8x Coal. (Items Cost: 1840 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:35:00.886
cmlm04ety00vvqo018znr8i3y	cmlltzy4f006jnw264h8kyavc	8	Acquired: 8x Coal	CREDIT	RAW	2026-02-14 07:35:00.887
cmlm04ph700vzqo01lupbdfze	cmllu0j14008nnw269ihx0pxl	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:35:14.683
cmlm04ph800w1qo01farnw5g8	cmllu0j14008nnw269ihx0pxl	3	Bulk Crafted: 3x Brown Paper	CREDIT	CRAFT	2026-02-14 07:35:14.684
cmlm04ph900w3qo01wko748pf	cmllu0j14008nnw269ihx0pxl	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 07:35:14.685
cmlm04pha00w5qo01hlnz68g3	cmllu0j14008nnw269ihx0pxl	15	Consumed 15x Water for crafting	DEBIT	RAW	2026-02-14 07:35:14.686
cmlm04qbt00w9qo01atghteq5	cmlltzwvk006dnw261evs8qz0	1150	Bulk Purchase: 5x Coal. (Items Cost: 1150 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:35:15.785
cmlm04qbu00wbqo01dume45b2	cmlltzwvk006dnw261evs8qz0	5	Acquired: 5x Coal	CREDIT	RAW	2026-02-14 07:35:15.786
cmlm05epo00wfqo01kr72p0mn	cmlltzy4f006jnw264h8kyavc	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:35:47.388
cmlm05ghi00wjqo015u4b4p8f	cmllu0bxd0083nw26cle9wtdh	10660	Bulk Purchase: 8x Glass, 30x Coal. (Items Cost: 10660 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:35:49.686
cmlm05ghl00wlqo01lni60v6y	cmllu0bxd0083nw26cle9wtdh	38	Acquired: 8x Glass, 30x Coal	CREDIT	RAW	2026-02-14 07:35:49.689
cmlm05qg000wnqo010nrhiakq	cmllu0i3k008jnw26vfsdew9m	230	Bulk Purchase: 1x Coal. (Items Cost: 230 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:36:02.593
cmlm05qig00wpqo010k4whmok	cmllu0i3k008jnw26vfsdew9m	1	Acquired: 1x Coal	CREDIT	RAW	2026-02-14 07:36:02.68
cmlm05sr800wrqo01t0whdhxp	cmllu01fk0071nw26rgvf2gft	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:36:05.588
cmlm06bte00wxqo01pdwan3y2	cmlltzxsz006hnw267qcl5gqp	2780	Bulk Purchase: 2x Glass, 8x Coal. (Items Cost: 2780 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:36:30.291
cmlm06bth00wzqo015lrbt9ud	cmlltzxsz006hnw267qcl5gqp	10	Acquired: 2x Glass, 8x Coal	CREDIT	RAW	2026-02-14 07:36:30.294
cmlm06fxs00x1qo01e8el5q1a	cmlltzwho006bnw2675cqbryr	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 07:36:35.632
cmlm06g3d00x3qo01pex0r2yr	cmllu0h0u008fnw2603crdwbl	11180	Sold 52x Water for 11180 Eternites	CREDIT	RAW	2026-02-14 07:36:35.833
cmlm06iaj00x5qo012gkgaj47	cmllu03le0077nw267n1s0mb6	2530	Bulk Purchase: 11x Coal. (Items Cost: 2530 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:36:38.684
cmlm06ial00x7qo01zjsod4fn	cmllu03le0077nw267n1s0mb6	11	Acquired: 11x Coal	CREDIT	RAW	2026-02-14 07:36:38.685
cmlm06nri00x9qo01smcxd7gf	cmllu05ad007dnw26h2vqc9kh	43600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:36:45.774
cmlm06op600xbqo012iadhmxe	cmlltzyqo006nnw26bdi47ek8	4700	Bulk Purchase: 10x Glass. (Items Cost: 4700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:36:46.987
cmlm06op800xdqo01e6w7ybr2	cmlltzyqo006nnw26bdi47ek8	10	Acquired: 10x Glass	CREDIT	RAW	2026-02-14 07:36:46.988
cmlm06pe900xfqo01hv9s8cfu	cmllu0hmt008hnw26efktlnfg	800	Thunt reward: 800 Eternities	CREDIT	ETERNITES	2026-02-14 07:36:47.889
cmlm06pmk00xhqo01bkfvsar5	cmlltzvq60067nw26qemjfwxj	11125	Bulk Purchase: 50x Wood, 25x Water. (Items Cost: 11125 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:36:48.188
cmlm06pml00xjqo01r3nr1qyx	cmlltzvq60067nw26qemjfwxj	75	Acquired: 50x Wood, 25x Water	CREDIT	RAW	2026-02-14 07:36:48.189
cmlm070qk00xlqo01mc5rx7qh	cmllu06j7007hnw26uw0sp36v	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:37:02.588
cmlm0757r00xnqo011a5g6s5a	cmllu06j7007hnw26uw0sp36v	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:37:08.391
cmlm075ry00xpqo018rxcneqx	cmllu05wr007fnw263pcca89z	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:37:09.117
cmlm07gef00xrqo01e5v4e9bo	cmllu0jsw008pnw26umu3i0fj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:37:22.887
cmlm07v2b00xvqo01fuwcm9am	cmlltzvq60067nw26qemjfwxj	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:37:41.892
cmlm07v2f00xxqo017ynfkg5i	cmlltzvq60067nw26qemjfwxj	5	Bulk Crafted: 5x Brown Paper	CREDIT	CRAFT	2026-02-14 07:37:41.895
cmlm07v2h00xzqo01j45t5hgh	cmlltzvq60067nw26qemjfwxj	50	Consumed 50x Wood for crafting	DEBIT	RAW	2026-02-14 07:37:41.897
cmlm07v4v00y1qo0114bltct4	cmlltzvq60067nw26qemjfwxj	25	Consumed 25x Water for crafting	DEBIT	RAW	2026-02-14 07:37:41.983
cmlm0815q00y3qo011rr9gcsk	cmllu0ik5008lnw26o95uvsly	1150	Bulk Purchase: 10x Wood. (Items Cost: 1150 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:37:49.791
cmlm0818e00y5qo01a0mdatwk	cmllu0ik5008lnw26o95uvsly	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 07:37:49.887
cmlm08j7l00y7qo01cvkccebd	cmllu0kvl008tnw26fe8h34vp	-2700000	Converted 2700000 USD to IDR	DEBIT	USD	2026-02-14 07:38:13.184
cmlm08j7l00y9qo01zyd656ym	cmllu0kvl008tnw26fe8h34vp	46691100000	Received 46691100000 IDR from USD	CREDIT	IDR	2026-02-14 07:38:13.184
cmlm08mdh00ybqo01a653o4r4	cmllu0l6u008vnw26jnnl3z1k	7525	Sold 35x Water for 7525 Eternites	CREDIT	RAW	2026-02-14 07:38:17.285
cmlm08wsh00ydqo0151fqekie	cmlltzvq60067nw26qemjfwxj	11000	Sold 5x Brown Paper for 11000 Eternites	CREDIT	CRAFT	2026-02-14 07:38:30.785
cmlm08wxz00yjqo01qgjmjk1o	cmllu08or007tnw26wd6mv6wd	3700	Bulk Purchase: 2x Glass, 12x Coal. (Items Cost: 3700 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:38:30.983
cmlm08wy000ylqo017ty0f3lf	cmllu08or007tnw26wd6mv6wd	14	Acquired: 2x Glass, 12x Coal	CREDIT	RAW	2026-02-14 07:38:30.984
cmlm094a300ynqo01jy2fgee8	cmllu00w3006znw26zc4y9ek0	1075	Sold 5x Water for 1075 Eternites	CREDIT	RAW	2026-02-14 07:38:40.491
cmlm09kca00ypqo01m61vai1l	cmllu082g007pnw26i9kqife7	430	Sold 2x Water for 430 Eternites	CREDIT	RAW	2026-02-14 07:39:01.306
cmlm09qyp00yrqo01rmigepfh	cmllu0ofe0099nw26n7luunss	1725	Sold 15x Wood for 1725 Eternites	CREDIT	RAW	2026-02-14 07:39:09.889
cmlm0a6us00ytqo01tfgxy915	cmllu0ofe0099nw26n7luunss	1150	Sold 5x Coal for 1150 Eternites	CREDIT	RAW	2026-02-14 07:39:30.484
cmlm0ahie00yxqo01mk2opsum	cmllu0hmt008hnw26efktlnfg	1505	Bulk Purchase: 7x Water. (Items Cost: 1505 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:39:44.294
cmlm0ahks00yzqo01ukx3kdqi	cmllu0hmt008hnw26efktlnfg	7	Acquired: 7x Water	CREDIT	RAW	2026-02-14 07:39:44.381
cmlm0akvp00z1qo0124o1gtwu	cmllu0l6u008vnw26jnnl3z1k	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:39:48.661
cmlm0apls00z3qo01yq9m72zd	cmllu05wr007fnw263pcca89z	500	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 07:39:54.784
cmlm0apls00z5qo01mnqlxl02	cmllu05wr007fnw263pcca89z	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 07:39:54.784
cmlm0av0c00z9qo01t1j0dfjw	cmllu004r006vnw263zlbwtzm	610	Bulk Purchase: 2x Wood, 1x Metal. (Items Cost: 610 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:40:01.789
cmlm0av0g00zbqo01c51112ij	cmllu004r006vnw263zlbwtzm	3	Acquired: 2x Wood, 1x Metal	CREDIT	RAW	2026-02-14 07:40:01.793
cmlm0b0jq00zdqo01iyfesmrv	cmllu082g007pnw26i9kqife7	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:40:08.966
cmlm0biux00zfqo01su2iccly	cmllu0jsw008pnw26umu3i0fj	9245	Sold 43x Water for 9245 Eternites	CREDIT	RAW	2026-02-14 07:40:32.697
cmlm0btf700zhqo01qp2emn2c	cmllu0ep90087nw26uyzbvykl	1075	Sold 5x Water for 1075 Eternites	CREDIT	RAW	2026-02-14 07:40:46.387
cmlm0c0ql00zjqo01lkivap6l	cmllu06j7007hnw26uw0sp36v	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:40:55.869
cmlm0c2u000zlqo01qa7mvrbr	cmllu0j14008nnw269ihx0pxl	4400	Sold 2x Brown Paper for 4400 Eternites	CREDIT	CRAFT	2026-02-14 07:40:58.583
cmlm0cabw00znqo017gfz0117	cmllu07dj007lnw261urdgi6e	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:41:08.3
cmlm0civb00zrqo018j5dlhvh	cmlltzwho006bnw2675cqbryr	1075	Bulk Purchase: 5x Water. (Items Cost: 1075 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:41:19.367
cmlm0civp00ztqo01myknhye7	cmlltzwho006bnw2675cqbryr	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 07:41:19.381
cmlm0cpik00zvqo01uqthqvzt	cmllu0jsw008pnw26umu3i0fj	9200	Bulk Purchase: 40x Coal. (Items Cost: 9200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:41:27.981
cmlm0cpim00zxqo01igmbn4c0	cmllu0jsw008pnw26umu3i0fj	40	Acquired: 40x Coal	CREDIT	RAW	2026-02-14 07:41:27.982
cmlm0ctom00zzqo0145629fri	cmllu0h0u008fnw2603crdwbl	10580	Bulk Purchase: 46x Coal. (Items Cost: 10580 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:41:33.383
cmlm0cton0101qo01bqnj2n27	cmllu0h0u008fnw2603crdwbl	46	Acquired: 46x Coal	CREDIT	RAW	2026-02-14 07:41:33.384
cmlm0cw8g0103qo01wmd3186z	cmlltzvq60067nw26qemjfwxj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:41:36.688
cmlm0dms30105qo01j7dyndki	cmllu082g007pnw26i9kqife7	6235	Sold 29x Water for 6235 Eternites	CREDIT	RAW	2026-02-14 07:42:11.09
cmlm0efsc0107qo01qrmsjd1n	cmllu03le0077nw267n1s0mb6	690	Sold 3x Coal for 690 Eternites	CREDIT	RAW	2026-02-14 07:42:48.587
cmlm0eg0v0109qo01ow9jfouo	cmlltzzt8006tnw26kuftz5q9	7475	Sold 65x Wood for 7475 Eternites	CREDIT	RAW	2026-02-14 07:42:48.991
cmlm0eg0v010bqo01g0sivl21	cmlltzzt8006tnw26kuftz5q9	2300	Sold 10x Coal for 2300 Eternites	CREDIT	RAW	2026-02-14 07:42:48.991
cmlm0eocl010dqo01e9kjb3kb	cmllu095j007vnw26ikcqk5fx	1290	Sold 6x Water for 1290 Eternites	CREDIT	RAW	2026-02-14 07:42:59.781
cmlm0f2mn010fqo017i630cyv	cmlltzz1o006pnw26ztynyxv4	3520	Bulk Purchase: 10x Wood, 1x Glass, 5x Metal. (Items Cost: 3520 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:43:18.288
cmlm0f2pf010jqo01arth3euy	cmllu0dry0085nw26fee82749	11825	Sold 55x Water for 11825 Eternites	CREDIT	RAW	2026-02-14 07:43:18.387
cmlm0f2pc010hqo01ftvq928r	cmlltzz1o006pnw26ztynyxv4	16	Acquired: 10x Wood, 1x Glass, 5x Metal	CREDIT	RAW	2026-02-14 07:43:18.385
cmlm0fm22010lqo01o8m01z3k	cmllu0ep90087nw26uyzbvykl	1880	Bulk Purchase: 4x Glass. (Items Cost: 1880 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:43:43.466
cmlm0fm2h010nqo01eg2lxnv2	cmllu0ep90087nw26uyzbvykl	4	Acquired: 4x Glass	CREDIT	RAW	2026-02-14 07:43:43.481
cmlm0fq04010pqo01knecqsn6	cmlltzyhy006lnw26tbnvyy6x	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:43:48.58
cmlm0gi64010tqo016l4tq203	cmllu0h0u008fnw2603crdwbl	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:44:25.084
cmlm0gul8010xqo01ll5chaz0	cmllu082g007pnw26i9kqife7	6210	Bulk Purchase: 27x Coal. (Items Cost: 6210 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:44:41.181
cmlm0gulb010zqo01rohd4t8z	cmllu082g007pnw26i9kqife7	27	Acquired: 27x Coal	CREDIT	RAW	2026-02-14 07:44:41.184
cmlm0gw510115qo01tevvyd4e	cmlltzzi0006rnw2673ipn4ol	24325	Bulk Purchase: 80x Wood, 3x Glass, 29x Water, 16x Coal, 10x Metal. (Items Cost: 24325 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:44:43.189
cmlm0gw520117qo01e7ktfyi0	cmlltzzi0006rnw2673ipn4ol	138	Acquired: 80x Wood, 3x Glass, 29x Water, 16x Coal, 10x Metal	CREDIT	RAW	2026-02-14 07:44:43.19
cmlm0gy55011bqo01sre7toi5	cmlltzvq60067nw26qemjfwxj	11040	Bulk Purchase: 48x Coal. (Items Cost: 11040 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:44:45.785
cmlm0gy7w011dqo01lnk9ac3g	cmlltzvq60067nw26qemjfwxj	48	Acquired: 48x Coal	CREDIT	RAW	2026-02-14 07:44:45.884
cmlm0h5cm011fqo0188r7y737	cmllu0j14008nnw269ihx0pxl	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:44:55.126
cmlm0h8sh011hqo01yxf82ow0	cmllu095j007vnw26ikcqk5fx	1150	Bulk Purchase: 10x Wood. (Items Cost: 1150 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:44:59.585
cmlm0h8sj011jqo01xwz1qsyy	cmllu095j007vnw26ikcqk5fx	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 07:44:59.587
cmlm0hg2z011lqo01s1yj3mmm	cmllu07os007nnw2657lw1mt3	9890	Sold 46x Water for 9890 Eternites	CREDIT	RAW	2026-02-14 07:45:09.035
cmlm0hi54011nqo0183rq6plq	cmllu05ad007dnw26h2vqc9kh	3950	Sold 1x Dividers for 3950 Eternites	CREDIT	CRAFT	2026-02-14 07:45:11.704
cmlm0hmzl011pqo01o0i6rdsb	cmllu05wr007fnw263pcca89z	2225	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2225 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:45:17.986
cmlm0hmzm011rqo01xdx5auvr	cmllu05wr007fnw263pcca89z	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 07:45:17.987
cmlm0hqyp0123qo01rakh7vkb	cmllu0fek0089nw26lw6emt67	2000	Thunt reward: 2000 Eternities	CREDIT	ETERNITES	2026-02-14 07:45:23.137
cmlm0i1n90125qo019mk18ill	cmllu0dry0085nw26fee82749	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:45:36.891
cmlm0i1vr0127qo01i3vvlds1	cmllu0l6u008vnw26jnnl3z1k	10350	Bulk Purchase: 45x Coal. (Items Cost: 10350 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:45:37.288
cmlm0i1vs0129qo01entc2dmk	cmllu0l6u008vnw26jnnl3z1k	45	Acquired: 45x Coal	CREDIT	RAW	2026-02-14 07:45:37.289
cmlm0i7jc012bqo01slo8w4mx	cmllu09jj007xnw26irsp7nwv	800	Thunt reward: 800 Eternities	CREDIT	ETERNITES	2026-02-14 07:45:44.616
cmlm0iggu012nqo01wkqqddc4	cmllu0i3k008jnw26vfsdew9m	215	Bulk Purchase: 1x Water. (Items Cost: 215 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:45:56.19
cmlm0iggv012pqo01z1qtup20	cmllu0i3k008jnw26vfsdew9m	1	Acquired: 1x Water	CREDIT	RAW	2026-02-14 07:45:56.191
cmlm0igrq012rqo01nf4d87v6	cmllu00kw006xnw261mwscl7e	2500	Thunt reward: 2500 Eternities	CREDIT	ETERNITES	2026-02-14 07:45:56.582
cmlm0ilsy0139qo01nhuq9389	cmllu01fk0071nw26rgvf2gft	1880	Bulk Purchase: 4x Glass. (Items Cost: 1880 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:46:03.106
cmlm0ilv3013bqo01heii7410	cmllu01fk0071nw26rgvf2gft	4	Acquired: 4x Glass	CREDIT	RAW	2026-02-14 07:46:03.183
cmlm0irqg013dqo01kznwphxz	cmllu06j7007hnw26uw0sp36v	5290	Bulk Purchase: 23x Coal. (Items Cost: 5290 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:46:10.792
cmlm0irt0013fqo01oh05mjk1	cmllu06j7007hnw26uw0sp36v	23	Acquired: 23x Coal	CREDIT	RAW	2026-02-14 07:46:10.884
cmlm0is1a013hqo01k1x1y60m	cmlltzzt8006tnw26kuftz5q9	9660	Bulk Purchase: 42x Coal. (Items Cost: 9660 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:46:11.182
cmlm0is1b013jqo01p6ve2bru	cmlltzzt8006tnw26kuftz5q9	42	Acquired: 42x Coal	CREDIT	RAW	2026-02-14 07:46:11.183
cmlm1vu3s01thqo01tct1kik7	cmlltzwho006bnw2675cqbryr	3640	Bulk Purchase: 22x Wood, 5x Water. (Items Cost: 3640 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:24:20.009
cmlm1vu6f01tjqo01wp88bayi	cmlltzwho006bnw2675cqbryr	27	Acquired: 22x Wood, 5x Water	CREDIT	RAW	2026-02-14 08:24:20.103
cmlm2ri810241qo01hpvsy4t4	cmllu0bxd0083nw26cle9wtdh	2100	Sold 6x Metal for 2100 Eternites	CREDIT	RAW	2026-02-14 08:48:57.602
cmlm2ri820243qo01ld37aor0	cmllu0bxd0083nw26cle9wtdh	2550	Sold 1x Brown Paper for 2550 Eternites	CREDIT	CRAFT	2026-02-14 08:48:57.602
cmlm0hqro011vqo016h4bhgte	cmlltzwho006bnw2675cqbryr	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:45:22.885
cmlm0hqrq011xqo01iwmogl2u	cmlltzwho006bnw2675cqbryr	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:45:22.886
cmlm0hqrr011zqo01nbcbc6we	cmlltzwho006bnw2675cqbryr	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:45:22.887
cmlm0hqrs0121qo01kfau9w63	cmlltzwho006bnw2675cqbryr	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:45:22.888
cmlm0ihmh012tqo01i1csn895	cmllu05wr007fnw263pcca89z	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:45:57.689
cmlm0ihmi012vqo01bqln5z14	cmllu05wr007fnw263pcca89z	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:45:57.69
cmlm0ihp1012xqo01d1ezlp6o	cmllu05wr007fnw263pcca89z	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:45:57.781
cmlm0ihp3012zqo01b6mf7fv1	cmllu05wr007fnw263pcca89z	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:45:57.783
cmlm1w3fo01tlqo01ssh2ewj4	cmllu01fk0071nw26rgvf2gft	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:24:32.013
cmlm1wgu501tnqo01gg4gsnos	cmllu0fek0089nw26lw6emt67	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:24:49.469
cmlm1wow601tzqo01jy7ske35	cmllu05wr007fnw263pcca89z	120	Bulk Purchase: 1x Wood. (Items Cost: 120 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:24:59.911
cmlm1wow801u1qo015uwi727r	cmllu05wr007fnw263pcca89z	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 08:24:59.912
cmlm1x0jh01uhqo01pya3ran6	cmlltzxsz006hnw267qcl5gqp	11400	Bulk Purchase: 57x Water. (Items Cost: 11400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:25:15.005
cmlm1x0ji01ujqo01yrstji4l	cmlltzxsz006hnw267qcl5gqp	57	Acquired: 57x Water	CREDIT	RAW	2026-02-14 08:25:15.006
cmlm1xg4j01utqo01jd72y3ud	cmllu03le0077nw267n1s0mb6	2200	Bulk Purchase: 10x Wood, 5x Water. (Items Cost: 2200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:25:35.203
cmlm1xg4n01uvqo01ui2egrww	cmllu03le0077nw267n1s0mb6	15	Acquired: 10x Wood, 5x Water	CREDIT	RAW	2026-02-14 08:25:35.207
cmlm1xldi01uxqo01u4byza1a	cmllu04r7007bnw26zxtj1wy7	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:25:42.006
cmlm1y4w801vbqo01sklkapmu	cmllu082g007pnw26i9kqife7	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:26:07.304
cmlm1yaam01vdqo016h0wlp6k	cmllu0ofe0099nw26n7luunss	4240	Bulk Purchase: 2x Wood, 20x Water. (Items Cost: 4240 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:26:14.303
cmlm1yaan01vfqo013a2j05t9	cmllu0ofe0099nw26n7luunss	22	Acquired: 2x Wood, 20x Water	CREDIT	RAW	2026-02-14 08:26:14.304
cmlm1yi3901vjqo016no7i4ti	cmllu0i3k008jnw26vfsdew9m	34000000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:26:24.405
cmlm1yudu01vlqo01vutvql8y	cmllu0bdv0081nw26gpystvor	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:26:40.339
cmlm1z22p01vxqo018nuolw2h	cmllu0dry0085nw26fee82749	6400	Bulk Purchase: 30x Wood, 14x Water. (Items Cost: 6400 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:26:50.305
cmlm1z25c01vzqo012d6vbbt0	cmllu0dry0085nw26fee82749	44	Acquired: 30x Wood, 14x Water	CREDIT	RAW	2026-02-14 08:26:50.4
cmlm1z65v01w1qo01a918l30u	cmlltzzi0006rnw2673ipn4ol	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:26:55.505
cmlm1z6mj01w3qo0185soa7oh	cmllu0bxd0083nw26cle9wtdh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:26:56.204
cmlm21gkl01x1qo01ctj4slje	cmllu0mw10093nw26ppcub6u6	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 08:28:42.405
cmlm21mqt01x7qo010nopsy19	cmllu0bdv0081nw26gpystvor	1160	Bulk Purchase: 3x Wood, 4x Water. (Items Cost: 1160 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:28:50.406
cmlm21mqu01x9qo01fq4tjep3	cmllu0bdv0081nw26gpystvor	7	Acquired: 3x Wood, 4x Water	CREDIT	RAW	2026-02-14 08:28:50.407
cmlm22cza01xbqo01l0thpaow	cmllu00kw006xnw261mwscl7e	1800	Bulk Purchase: 15x Wood. (Items Cost: 1800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:29:24.406
cmlm22cza01xdqo01jdd14wys	cmllu00kw006xnw261mwscl7e	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 08:29:24.407
cmlm22hm101xfqo01y1y3c96q	cmlltzwvk006dnw261evs8qz0	1800	Bulk Purchase: 9x Water. (Items Cost: 1800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:29:30.409
cmlm22hrg01xhqo014cyp5jpe	cmlltzwvk006dnw261evs8qz0	9	Acquired: 9x Water	CREDIT	RAW	2026-02-14 08:29:30.605
cmlm2si6n024fqo016lz8vcmu	cmllu0bxd0083nw26cle9wtdh	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:49:44.207
cmlm2si6p024hqo012367ma75	cmllu0bxd0083nw26cle9wtdh	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 08:49:44.21
cmlm2si6r024jqo01msew9dkp	cmllu0bxd0083nw26cle9wtdh	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:49:44.211
cmlm2si6r024lqo01gj0li7zr	cmllu0bxd0083nw26cle9wtdh	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 08:49:44.212
cmlm0i9wn012fqo011eiy5mr7	cmllu095j007vnw26ikcqk5fx	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:45:47.688
cmlm0i9wp012hqo01a0ikpulo	cmllu095j007vnw26ikcqk5fx	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 07:45:47.689
cmlm0i9wq012jqo01152lhg8a	cmllu095j007vnw26ikcqk5fx	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:45:47.691
cmlm0i9wr012lqo01tkxavnuo	cmllu095j007vnw26ikcqk5fx	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 07:45:47.692
cmlm0isys013lqo01vy6dnaad	cmlltzy4f006jnw264h8kyavc	3010	Sold 14x Water for 3010 Eternites	CREDIT	RAW	2026-02-14 07:46:12.388
cmlm0j0cd013nqo01d59qqgmz	cmllu095j007vnw26ikcqk5fx	3100	Sold 1x Pen for 3100 Eternites	CREDIT	CRAFT	2026-02-14 07:46:21.949
cmlm0k099013rqo01wt8ms857	cmllu01fk0071nw26rgvf2gft	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:47:08.494
cmlm0k0br013tqo01tmra19di	cmllu01fk0071nw26rgvf2gft	2	Bulk Crafted: 2x Magnifying Glass	CREDIT	CRAFT	2026-02-14 07:47:08.583
cmlm0k0bt013vqo01htm5tk0f	cmllu01fk0071nw26rgvf2gft	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 07:47:08.585
cmlm0k0bu013xqo01lgafdhok	cmllu01fk0071nw26rgvf2gft	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 07:47:08.586
cmlm0k0bv013zqo01zyklvk6i	cmllu01fk0071nw26rgvf2gft	4	Consumed 4x Glass for crafting	DEBIT	RAW	2026-02-14 07:47:08.587
cmlm0k49j0141qo01588jw8bd	cmlltzzi0006rnw2673ipn4ol	1840	Bulk Purchase: 8x Coal. (Items Cost: 1840 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:47:13.687
cmlm0k49k0143qo0146jvw6sq	cmlltzzi0006rnw2673ipn4ol	8	Acquired: 8x Coal	CREDIT	RAW	2026-02-14 07:47:13.689
cmlm0k7qm0145qo01e5jfjo77	cmllu03le0077nw267n1s0mb6	920	Sold 4x Coal for 920 Eternites	CREDIT	RAW	2026-02-14 07:47:18.191
cmlm0kn670147qo01gsmxk03b	cmllu07os007nnw2657lw1mt3	9120	Bulk Purchase: 24x Metal. (Items Cost: 9120 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:47:38.191
cmlm0kn680149qo01tiahzjn6	cmllu07os007nnw2657lw1mt3	24	Acquired: 24x Metal	CREDIT	RAW	2026-02-14 07:47:38.192
cmlm0kpka014bqo011ek40gvk	cmllu0ofe0099nw26n7luunss	3450	Bulk Purchase: 15x Coal. (Items Cost: 3450 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:47:41.291
cmlm0kpmy014dqo01pw2szl7o	cmllu0ofe0099nw26n7luunss	15	Acquired: 15x Coal	CREDIT	RAW	2026-02-14 07:47:41.387
cmlm0kq11014fqo01zr2rmkcb	cmllu07dj007lnw261urdgi6e	26800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:47:41.891
cmlm0ku44014hqo019zs16mdo	cmlltzy4f006jnw264h8kyavc	3290	Bulk Purchase: 7x Glass. (Items Cost: 3290 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:47:47.189
cmlm0ku45014jqo01njhbaanh	cmlltzy4f006jnw264h8kyavc	7	Acquired: 7x Glass	CREDIT	RAW	2026-02-14 07:47:47.19
cmlm0kuia014nqo015qnww32o	cmllu03le0077nw267n1s0mb6	1505	Bulk Purchase: 7x Water. (Items Cost: 1505 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:47:47.698
cmlm0kuia014pqo01t8zicej3	cmllu03le0077nw267n1s0mb6	7	Acquired: 7x Water	CREDIT	RAW	2026-02-14 07:47:47.699
cmlm0m3k9014xqo015ndnfbub	cmllu00kw006xnw261mwscl7e	3225	Sold 15x Water for 3225 Eternites	CREDIT	RAW	2026-02-14 07:48:46.089
cmlm0mjm10157qo01b8m0fmlk	cmllu0ofe0099nw26n7luunss	1075	Bulk Purchase: 5x Water. (Items Cost: 1075 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:49:06.889
cmlm0mjm30159qo01nmgw4t3u	cmllu0ofe0099nw26n7luunss	5	Acquired: 5x Water	CREDIT	RAW	2026-02-14 07:49:06.891
cmlm0mlb8015bqo019si96tdp	cmllu03le0077nw267n1s0mb6	1505	Sold 7x Water for 1505 Eternites	CREDIT	RAW	2026-02-14 07:49:09.092
cmlm0mn0e015dqo01t8s6wlzy	cmlltzzi0006rnw2673ipn4ol	1505	Bulk Purchase: 7x Water. (Items Cost: 1505 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:49:11.292
cmlm0mn0g015fqo012m7x9s1w	cmlltzzi0006rnw2673ipn4ol	7	Acquired: 7x Water	CREDIT	RAW	2026-02-14 07:49:11.296
cmlm0mz1j015hqo018r39p431	cmllu0ofe0099nw26n7luunss	690	Bulk Purchase: 6x Wood. (Items Cost: 690 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:49:26.887
cmlm0mz1k015jqo01ncrr0l25	cmllu0ofe0099nw26n7luunss	6	Acquired: 6x Wood	CREDIT	RAW	2026-02-14 07:49:26.889
cmlm0n1qu015tqo01qzgywysw	cmlltzzi0006rnw2673ipn4ol	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:49:30.391
cmlm0n1qv015vqo01ucxf6c0b	cmlltzzi0006rnw2673ipn4ol	9	Bulk Crafted: 3x Brown Paper, 1x Pen, 1x Magnifying Glass, 3x Ink, 1x Dividers	CREDIT	CRAFT	2026-02-14 07:49:30.391
cmlm0n1qv015xqo01690us26b	cmlltzzi0006rnw2673ipn4ol	65	Consumed 65x Wood for crafting	DEBIT	RAW	2026-02-14 07:49:30.392
cmlm0n1qw015zqo01yzeegsio	cmlltzzi0006rnw2673ipn4ol	36	Consumed 36x Water for crafting	DEBIT	RAW	2026-02-14 07:49:30.393
cmlm0n1qx0161qo01xl692m0l	cmlltzzi0006rnw2673ipn4ol	20	Consumed 20x Coal for crafting	DEBIT	RAW	2026-02-14 07:49:30.393
cmlm0n1qx0163qo016nr711pu	cmlltzzi0006rnw2673ipn4ol	10	Consumed 10x Metal for crafting	DEBIT	RAW	2026-02-14 07:49:30.394
cmlm0n1qy0165qo015tfmdr6l	cmlltzzi0006rnw2673ipn4ol	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 07:49:30.395
cmlm0nheo0167qo01qhw639ni	cmllu03le0077nw267n1s0mb6	1610	Bulk Purchase: 7x Coal. (Items Cost: 1610 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:49:50.688
cmlm0nheq0169qo01tkhs8q0s	cmllu03le0077nw267n1s0mb6	7	Acquired: 7x Coal	CREDIT	RAW	2026-02-14 07:49:50.691
cmlm0qa6l016bqo013lwhrcxp	cmlltzyqo006nnw26bdi47ek8	7800	Sold 15x Glass for 7800 Eternites	CREDIT	RAW	2026-02-14 07:52:01.292
cmlm0qaf4016dqo013s2nczim	cmllu0j14008nnw269ihx0pxl	51600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:52:01.601
cmlm0qayc016fqo01t2btxsf0	cmllu0ep90087nw26uyzbvykl	2600	Sold 5x Glass for 2600 Eternites	CREDIT	RAW	2026-02-14 07:52:02.2
cmlm0qb40016hqo0115kkb8nd	cmlltzxsz006hnw267qcl5gqp	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 07:52:02.497
cmlm0qpds016jqo01hotxdtge	cmllu0l6u008vnw26jnnl3z1k	1040	Sold 2x Glass for 1040 Eternites	CREDIT	RAW	2026-02-14 07:52:20.992
cmlm0qpds016lqo01rtwjqlx3	cmllu0l6u008vnw26jnnl3z1k	13050	Sold 45x Coal for 13050 Eternites	CREDIT	RAW	2026-02-14 07:52:20.992
cmlm0qs5v016nqo011t0zoc7i	cmllu0i3k008jnw26vfsdew9m	215	Sold 1x Water for 215 Eternites	CREDIT	RAW	2026-02-14 07:52:24.594
cmlm0qs5v016pqo01wdz39iyw	cmllu0i3k008jnw26vfsdew9m	10150	Sold 35x Coal for 10150 Eternites	CREDIT	RAW	2026-02-14 07:52:24.594
cmlm0qspf016rqo01jrkfs0a6	cmllu0bdv0081nw26gpystvor	2320	Sold 8x Coal for 2320 Eternites	CREDIT	RAW	2026-02-14 07:52:25.299
cmlm0qz6z016tqo01xv1ra5ie	cmllu08or007tnw26wd6mv6wd	1040	Sold 2x Glass for 1040 Eternites	CREDIT	RAW	2026-02-14 07:52:33.707
cmlm0qz6z016vqo018yi04p7t	cmllu08or007tnw26wd6mv6wd	3480	Sold 12x Coal for 3480 Eternites	CREDIT	RAW	2026-02-14 07:52:33.707
cmlm0r014016xqo01jshwzso7	cmlltzwvk006dnw261evs8qz0	1450	Sold 5x Coal for 1450 Eternites	CREDIT	RAW	2026-02-14 07:52:34.703
cmlm0r0cd016zqo01e0u5rybb	cmlltzzi0006rnw2673ipn4ol	2500	Paid cost for Map Recipe	DEBIT	ETERNITES	2026-02-14 07:52:35.196
cmlm0r0cd0171qo01riw3zhc2	cmlltzzi0006rnw2673ipn4ol	8	Consumed items for 1 Map(s)	DEBIT	CRAFT	2026-02-14 07:52:35.196
cmlm0r0cd0173qo01s5aiyjvk	cmlltzzi0006rnw2673ipn4ol	1	Crafted 1 Map(s)	CREDIT	MAP	2026-02-14 07:52:35.196
cmlm0r2tb0175qo01hwvm2nel	cmllu07dj007lnw261urdgi6e	2100	Bulk Purchase: 20x Wood. (Items Cost: 2100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:52:38.4
cmlm0r9wx0179qo01uj19n5d6	cmllu0jsw008pnw26umu3i0fj	580	Sold 2x Coal for 580 Eternites	CREDIT	RAW	2026-02-14 07:52:47.601
cmlm0rcgh017dqo01hm572y9z	cmlltzzt8006tnw26kuftz5q9	12180	Sold 42x Coal for 12180 Eternites	CREDIT	RAW	2026-02-14 07:52:50.896
cmlm0s1dk017lqo01y7yuhv0i	cmllu0bxd0083nw26cle9wtdh	4160	Sold 8x Glass for 4160 Eternites	CREDIT	RAW	2026-02-14 07:53:23.191
cmlm0s1dk017nqo011gucsrok	cmllu0bxd0083nw26cle9wtdh	8700	Sold 30x Coal for 8700 Eternites	CREDIT	RAW	2026-02-14 07:53:23.191
cmlm0sa3g017rqo01t5mie1do	cmlltzy4f006jnw264h8kyavc	3640	Sold 7x Glass for 3640 Eternites	CREDIT	RAW	2026-02-14 07:53:34.491
cmlm0si4d017vqo0196fvg596	cmlltzzi0006rnw2673ipn4ol	110000000000	Sold 1x Map for 110000000000 IDR	CREDIT	MAP	2026-02-14 07:53:44.892
cmlm0smix017xqo01wyjuudvo	cmllu0fek0089nw26lw6emt67	3480	Sold 12x Coal for 3480 Eternites	CREDIT	RAW	2026-02-14 07:53:50.601
cmlm0t2ji0181qo01wo307msv	cmllu082g007pnw26i9kqife7	290	Sold 1x Coal for 290 Eternites	CREDIT	RAW	2026-02-14 07:54:11.358
cmlm0toer018jqo010medhg7o	cmlltzvq60067nw26qemjfwxj	13920	Sold 48x Coal for 13920 Eternites	CREDIT	RAW	2026-02-14 07:54:39.699
cmlm0ttm3018lqo01k11bstk6	cmllu0h0u008fnw2603crdwbl	13340	Sold 46x Coal for 13340 Eternites	CREDIT	RAW	2026-02-14 07:54:46.443
cmlm0tz9g018nqo01914qdjrf	cmllu06j7007hnw26uw0sp36v	2030	Sold 7x Coal for 2030 Eternites	CREDIT	RAW	2026-02-14 07:54:53.764
cmlm1wk9l01trqo017rfekdqr	cmllu00kw006xnw261mwscl7e	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:24:53.914
cmlm1wk9n01ttqo018yep2bf2	cmllu00kw006xnw261mwscl7e	2	Bulk Crafted: 2x Brown Paper	CREDIT	CRAFT	2026-02-14 08:24:53.915
cmlm1wk9o01tvqo014mnw063u	cmllu00kw006xnw261mwscl7e	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 08:24:53.916
cmlm1wk9p01txqo01piunhoab	cmllu00kw006xnw261mwscl7e	10	Consumed 10x Water for crafting	DEBIT	RAW	2026-02-14 08:24:53.918
cmlm1xffm01upqo014t8cs9x7	cmllu07os007nnw2657lw1mt3	750	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:25:34.306
cmlm1xffm01urqo012awuila4	cmllu07os007nnw2657lw1mt3	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:25:34.306
cmlm1xnrm01v1qo017fhrbyu5	cmllu0ik5008lnw26o95uvsly	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:25:45.106
cmlm1xnrn01v3qo01sdqi9uye	cmllu0ik5008lnw26o95uvsly	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:25:45.107
cmlm1xnrn01v5qo01vesr91g9	cmllu0ik5008lnw26o95uvsly	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:25:45.108
cmlm1xnro01v7qo01ocdty3zi	cmllu0ik5008lnw26o95uvsly	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:25:45.109
cmlm1xnrp01v9qo01rn789u8s	cmllu0ik5008lnw26o95uvsly	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:25:45.109
cmlm1ydjp01vhqo01x95koy6b	cmllu0jsw008pnw26umu3i0fj	12240	Sold 102x Wood for 12240 Eternites	CREDIT	RAW	2026-02-14 08:26:18.517
cmlm1yvig01vnqo01ja33z5md	cmllu0ik5008lnw26o95uvsly	4300	Sold 1x Magnifying Glass for 4300 Eternites	CREDIT	CRAFT	2026-02-14 08:26:41.8
cmlm1yxoh01vpqo01i9y9d0b3	cmllu03le0077nw267n1s0mb6	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:26:44.609
cmlm1yxr101vrqo01ze04pwl0	cmllu03le0077nw267n1s0mb6	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 08:26:44.701
cmlm1yxr401vtqo01umhgmw7o	cmllu03le0077nw267n1s0mb6	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:26:44.704
cmlm1yxr601vvqo01x82eu6es	cmllu03le0077nw267n1s0mb6	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 08:26:44.707
cmlm2t8vv024nqo01a0bu7gl7	cmllu00w3006znw26zc4y9ek0	15000	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 08:50:18.811
cmlm2t8vv024pqo013ii5scy4	cmllu00w3006znw26zc4y9ek0	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 08:50:18.811
cmlm0raoi017bqo013zne9xpj	cmlltzyqo006nnw26bdi47ek8	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:52:48.594
cmlm0sg0s017tqo01nexg5eri	cmllu0i3k008jnw26vfsdew9m	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:53:42.172
cmlm0stgp017zqo01fjpxi7z0	cmllu0l6u008vnw26jnnl3z1k	4000	Pay Pitching Fee (4000)	DEBIT	ETERNITES	2026-02-14 07:53:59.593
cmlm0tdu90183qo01e46kl9jv	cmllu0jsw008pnw26umu3i0fj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:54:26.001
cmlm0tmk1018hqo01iljojm2x	cmllu01fk0071nw26rgvf2gft	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:54:37.202
cmlm0u98n018rqo01roc5jqw7	cmlltzy4f006jnw264h8kyavc	1050	Bulk Purchase: 10x Wood. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:55:06.695
cmlm0u98o018tqo017zi6j9em	cmlltzy4f006jnw264h8kyavc	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 07:55:06.696
cmlm1wpa401u5qo01aff3sqy8	cmllu07os007nnw2657lw1mt3	7850	Bought 3 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:25:00.412
cmlm1wpa401u7qo01tft8cab0	cmllu07os007nnw2657lw1mt3	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:25:00.412
cmlm1wug201u9qo011wj99nq3	cmlltzwho006bnw2675cqbryr	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:25:07.107
cmlm1wug401ubqo01xsmwfc28	cmlltzwho006bnw2675cqbryr	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 08:25:07.108
cmlm1wuiq01udqo01bl9wx2z7	cmlltzwho006bnw2675cqbryr	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:25:07.202
cmlm1wuir01ufqo01qghfd8j8	cmlltzwho006bnw2675cqbryr	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 08:25:07.204
cmlm1x8kh01ulqo01ydo4wu1q	cmllu0dry0085nw26fee82749	4300	Sold 1x Magnifying Glass for 4300 Eternites	CREDIT	CRAFT	2026-02-14 08:25:25.409
cmlm1zs0001wdqo01w3tcuvix	cmlltzz1o006pnw26ztynyxv4	1750	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:27:23.903
cmlm1zs0001wfqo011rrha9oi	cmlltzz1o006pnw26ztynyxv4	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:27:23.903
cmlm217p601wzqo017jt3om6a	cmllu02z70075nw267utb00t1	3700	Sold 1x Pen for 3700 Eternites	CREDIT	CRAFT	2026-02-14 08:28:30.901
cmlm2thwu024rqo01pslszj69	cmllu0bxd0083nw26cle9wtdh	7650	Sold 3x Brown Paper for 7650 Eternites	CREDIT	CRAFT	2026-02-14 08:50:30.511
cmlm2thwv024tqo01wqy1dpmg	cmllu0bxd0083nw26cle9wtdh	3450	Sold 1x Pen for 3450 Eternites	CREDIT	CRAFT	2026-02-14 08:50:30.511
cmlm2thwv024vqo01iycdllxg	cmllu0bxd0083nw26cle9wtdh	4000	Sold 1x Magnifying Glass for 4000 Eternites	CREDIT	CRAFT	2026-02-14 08:50:30.511
cmlm2thwv024xqo01fxu0cy95	cmllu0bxd0083nw26cle9wtdh	5200	Sold 2x Ink for 5200 Eternites	CREDIT	CRAFT	2026-02-14 08:50:30.511
cmlm2thwv024zqo0114c64bh6	cmllu0bxd0083nw26cle9wtdh	3600	Sold 1x Dividers for 3600 Eternites	CREDIT	CRAFT	2026-02-14 08:50:30.511
cmlm0rsqe017fqo01y8h83jht	cmllu01fk0071nw26rgvf2gft	2900	Sold 10x Coal for 2900 Eternites	CREDIT	RAW	2026-02-14 07:53:11.904
cmlm0rul9017hqo01wldlaqii	cmllu03le0077nw267n1s0mb6	3190	Sold 11x Coal for 3190 Eternites	CREDIT	RAW	2026-02-14 07:53:14.397
cmlm0rxsy017jqo01bbqq4atg	cmllu01fk0071nw26rgvf2gft	7400	Sold 2x Magnifying Glass for 7400 Eternites	CREDIT	CRAFT	2026-02-14 07:53:18.563
cmlm0s3xb017pqo01ze7icp4f	cmllu0ofe0099nw26n7luunss	5800	Sold 20x Coal for 5800 Eternites	CREDIT	RAW	2026-02-14 07:53:26.495
cmlm0th8p0185qo01hqn5odo2	cmllu09jj007xnw26irsp7nwv	1040	Sold 2x Glass for 1040 Eternites	CREDIT	RAW	2026-02-14 07:54:30.409
cmlm0tigt0189qo019ems3it3	cmllu07dj007lnw261urdgi6e	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:54:31.997
cmlm0tigu018bqo010kidec7c	cmllu07dj007lnw261urdgi6e	1	Bulk Crafted: 1x Brown Paper	CREDIT	CRAFT	2026-02-14 07:54:31.998
cmlm0tigv018dqo010155nq0h	cmllu07dj007lnw261urdgi6e	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:54:31.999
cmlm0tigw018fqo01g1hagorm	cmllu07dj007lnw261urdgi6e	5	Consumed 5x Water for crafting	DEBIT	RAW	2026-02-14 07:54:32.001
cmlm0u6rx018pqo01umpzbyyk	cmllu0ep90087nw26uyzbvykl	290	Sold 1x Coal for 290 Eternites	CREDIT	RAW	2026-02-14 07:55:03.501
cmlm0v097018vqo01ynlbc4dm	cmllu0mw10093nw26ppcub6u6	2100	Bulk Purchase: 20x Wood. (Items Cost: 2100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:55:41.707
cmlm0v0bm018xqo013o3np8iu	cmllu0mw10093nw26ppcub6u6	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 07:55:41.794
cmlm0v540018zqo01urps0uqd	cmlltzy4f006jnw264h8kyavc	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:55:48
cmlm0vd4t0191qo019r8t3ocz	cmllu02a60073nw26f5vv4wcw	1050	Bulk Purchase: 10x Wood. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:55:58.398
cmlm0vd4v0193qo01nrzzk31v	cmllu02a60073nw26f5vv4wcw	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 07:55:58.399
cmlm0vfdd0195qo01bl2adjcx	cmllu0bxd0083nw26cle9wtdh	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:56:01.215
cmlm0vlq70197qo01md127k4x	cmllu0h0u008fnw2603crdwbl	9000	Pay Pitching Fee (9000)	DEBIT	ETERNITES	2026-02-14 07:56:09.535
cmlm0vx46019bqo01gboro2ds	cmllu06j7007hnw26uw0sp36v	2100	Bulk Purchase: 20x Wood. (Items Cost: 2100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:56:24.294
cmlm0vx47019dqo012k0r5to5	cmllu06j7007hnw26uw0sp36v	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 07:56:24.296
cmlm0w7xc019fqo01xf1g6pli	cmllu0mw10093nw26ppcub6u6	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 07:56:38.304
cmlm0wqzb019jqo013njl8phv	cmllu06j7007hnw26uw0sp36v	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:57:03
cmlm0wqzd019lqo01fdt9lazu	cmllu06j7007hnw26uw0sp36v	2	Bulk Crafted: 2x Pen	CREDIT	CRAFT	2026-02-14 07:57:03.002
cmlm0wqze019nqo01qt1szwdq	cmllu06j7007hnw26uw0sp36v	20	Consumed 20x Wood for crafting	DEBIT	RAW	2026-02-14 07:57:03.003
cmlm0wqzf019pqo01hg8o8mxq	cmllu06j7007hnw26uw0sp36v	16	Consumed 16x Coal for crafting	DEBIT	RAW	2026-02-14 07:57:03.004
cmlm0x4px019rqo018bsm7rh7	cmllu00kw006xnw261mwscl7e	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:57:20.805
cmlm0xos1019tqo01wljv97gi	cmlltzyqo006nnw26bdi47ek8	7920	Bulk Purchase: 22x Metal. (Items Cost: 7920 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:57:46.801
cmlm0xos2019vqo011f7h0pmt	cmlltzyqo006nnw26bdi47ek8	22	Acquired: 22x Metal	CREDIT	RAW	2026-02-14 07:57:46.802
cmlm0xvby019zqo01a310zx82	cmlltzwvk006dnw261evs8qz0	1575	Bulk Purchase: 15x Wood. (Items Cost: 1575 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:57:55.295
cmlm0xvbz01a1qo01yoygfgeo	cmlltzwvk006dnw261evs8qz0	15	Acquired: 15x Wood	CREDIT	RAW	2026-02-14 07:57:55.296
cmlm0xy9p01a5qo019cl9bcy5	cmlltzy4f006jnw264h8kyavc	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 07:57:59.101
cmlm0xy9q01a7qo01125sfjfz	cmlltzy4f006jnw264h8kyavc	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 07:57:59.102
cmlm0xy9r01a9qo015s8qbo05	cmlltzy4f006jnw264h8kyavc	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 07:57:59.103
cmlm0xy9r01abqo01nazwteby	cmlltzy4f006jnw264h8kyavc	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 07:57:59.104
cmlm0xzwa01adqo01rbwj2exv	cmllu06j7007hnw26uw0sp36v	7100	Sold 2x Pen for 7100 Eternites	CREDIT	CRAFT	2026-02-14 07:58:01.21
cmlm0y7ap01afqo015cjv5jqf	cmllu00w3006znw26zc4y9ek0	1800	Thunt reward: 1800 Eternities	CREDIT	ETERNITES	2026-02-14 07:58:10.801
cmlm0ykc001ahqo012y9dwk9j	cmllu05ad007dnw26h2vqc9kh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:58:27.606
cmlm0yle901ajqo01f5jay4hf	cmllu0l6u008vnw26jnnl3z1k	38800000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 07:58:29.073
cmlm0ypfr01alqo0189wi89vk	cmllu082g007pnw26i9kqife7	7540	Sold 26x Coal for 7540 Eternites	CREDIT	RAW	2026-02-14 07:58:34.307
cmlm0z1jm01anqo01vhr3p1zv	cmllu07os007nnw2657lw1mt3	720	Sold 2x Metal for 720 Eternites	CREDIT	RAW	2026-02-14 07:58:50.003
cmlm0z9q501apqo01dyvb9k29	cmllu06j7007hnw26uw0sp36v	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 07:59:00.604
cmlm0zlj501arqo01lypqt0ye	cmllu0ik5008lnw26o95uvsly	1080	Bulk Purchase: 3x Metal. (Items Cost: 1080 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:59:15.906
cmlm0zllo01atqo01x05bebxh	cmllu0ik5008lnw26o95uvsly	3	Acquired: 3x Metal	CREDIT	RAW	2026-02-14 07:59:15.996
cmlm1037h01avqo0120f62tga	cmlltzw6n0069nw266t9ghu5c	800	Thunt reward: 800 Eternities	CREDIT	ETERNITES	2026-02-14 07:59:38.813
cmlm10gjp01axqo01005crlti	cmlltzy4f006jnw264h8kyavc	1800	Bulk Purchase: 5x Metal. (Items Cost: 1800 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:59:56.101
cmlm10gjq01azqo01jou0x4f9	cmlltzy4f006jnw264h8kyavc	5	Acquired: 5x Metal	CREDIT	RAW	2026-02-14 07:59:56.102
cmlm10ih601b3qo01hvomt2wg	cmllu0ik5008lnw26o95uvsly	430	Bulk Purchase: 2x Water. (Items Cost: 430 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 07:59:58.602
cmlm10ih701b5qo018tfjfo55	cmllu0ik5008lnw26o95uvsly	2	Acquired: 2x Water	CREDIT	RAW	2026-02-14 07:59:58.603
cmlm10rnt01b7qo013ys9l8tf	cmllu07os007nnw2657lw1mt3	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:00:10.506
cmlm10s9t01b9qo01ea2wx4wu	cmllu082g007pnw26i9kqife7	7875	Bulk Purchase: 75x Wood. (Items Cost: 7875 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:00:11.297
cmlm10s9u01bbqo01aurun4vl	cmllu082g007pnw26i9kqife7	75	Acquired: 75x Wood	CREDIT	RAW	2026-02-14 08:00:11.299
cmlm10wik01bdqo01uk1zfk9g	cmllu0mw10093nw26ppcub6u6	1890	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:00:16.736
cmlm10wik01bfqo01epfoyx45	cmllu0mw10093nw26ppcub6u6	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:00:16.736
cmlm110ri01bhqo01cp8zznvh	cmllu00w3006znw26zc4y9ek0	2665	Bulk Purchase: 7x Water, 4x Coal. (Items Cost: 2665 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:00:22.302
cmlm110rj01bjqo01pw48v8o3	cmllu00w3006znw26zc4y9ek0	11	Acquired: 7x Water, 4x Coal	CREDIT	RAW	2026-02-14 08:00:22.303
cmlm114hl01blqo01ypwura7e	cmlltzvq60067nw26qemjfwxj	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:00:27.129
cmlm115h801bnqo01zwyfglpw	cmllu06wy007jnw26xy0x6dn5	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:00:28.412
cmlm11cey01brqo01fkvn8ak5	cmllu095j007vnw26ikcqk5fx	2850	Bulk Purchase: 10x Wood, 5x Metal. (Items Cost: 2850 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:00:37.403
cmlm11cez01btqo01bzw9m2t0	cmllu095j007vnw26ikcqk5fx	15	Acquired: 10x Wood, 5x Metal	CREDIT	RAW	2026-02-14 08:00:37.403
cmlm11fi401bvqo01c7cibwn5	cmllu0kvl008tnw26fe8h34vp	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:00:41.405
cmlm11o7v01bxqo01ggnpm43e	cmllu00w3006znw26zc4y9ek0	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:00:52.7
cmlm11o7y01bzqo01jck2jqjn	cmllu00w3006znw26zc4y9ek0	1	Bulk Crafted: 1x Ink	CREDIT	CRAFT	2026-02-14 08:00:52.702
cmlm11o7z01c1qo016qbkzaai	cmllu00w3006znw26zc4y9ek0	7	Consumed 7x Water for crafting	DEBIT	RAW	2026-02-14 08:00:52.703
cmlm11o8001c3qo01kapnugji	cmllu00w3006znw26zc4y9ek0	4	Consumed 4x Coal for crafting	DEBIT	RAW	2026-02-14 08:00:52.704
cmlm11rb601c5qo017e94w0c1	cmllu0gh8008dnw26sfpjylw0	100	Treasure Hunt Participation Fee	DEBIT	ETERNITES	2026-02-14 08:00:56.706
cmlm11sm801c7qo01q2sd3ntr	cmllu05ad007dnw26h2vqc9kh	1090	Bulk Purchase: 2x Wood, 1x Glass, 1x Metal. (Items Cost: 1090 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:00:58.401
cmlm11sm901c9qo015ji9u0ah	cmllu05ad007dnw26h2vqc9kh	4	Acquired: 2x Wood, 1x Glass, 1x Metal	CREDIT	RAW	2026-02-14 08:00:58.402
cmlm11v3c01cbqo01sh42tqc4	cmlltzzt8006tnw26kuftz5q9	12390	Bulk Purchase: 118x Wood. (Items Cost: 12390 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:01:01.608
cmlm11v3d01cdqo01a8nf7gtl	cmlltzzt8006tnw26kuftz5q9	118	Acquired: 118x Wood	CREDIT	RAW	2026-02-14 08:01:01.609
cmlm1271u01cfqo0178062gqu	cmllu02z70075nw267utb00t1	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:01:17.106
cmlm12cdc01cjqo01n4vq4f4o	cmllu004r006vnw263zlbwtzm	105	Bulk Purchase: 1x Wood. (Items Cost: 105 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:01:24.001
cmlm12cdd01clqo01pk9k5u6t	cmllu004r006vnw263zlbwtzm	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 08:01:24.002
cmlm12jur01czqo01nn18derv	cmllu0bxd0083nw26cle9wtdh	10110	Bulk Purchase: 30x Wood, 24x Coal. (Items Cost: 10110 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:01:33.699
cmlm12juu01d1qo019jwym649	cmllu0bxd0083nw26cle9wtdh	54	Acquired: 30x Wood, 24x Coal	CREDIT	RAW	2026-02-14 08:01:33.703
cmlm12zy401d3qo016vvm028e	cmllu01fk0071nw26rgvf2gft	5000000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 08:01:54.556
cmlm135xp01d5qo01ekop0kmp	cmllu095j007vnw26ikcqk5fx	290	Sold 1x Coal for 290 Eternites	CREDIT	RAW	2026-02-14 08:02:02.313
cmlm135xq01d7qo01fi3gdfgu	cmllu095j007vnw26ikcqk5fx	3700	Sold 1x Magnifying Glass for 3700 Eternites	CREDIT	CRAFT	2026-02-14 08:02:02.313
cmlm13h6q01d9qo01ra7lb9tr	cmlltzwho006bnw2675cqbryr	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:02:16.898
cmlm13zal01dlqo0125by4lr5	cmllu08or007tnw26wd6mv6wd	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:02:40.365
cmlm1410w01dpqo01urrab4nu	cmllu00kw006xnw261mwscl7e	2500	Bulk Purchase: 4x Wood, 4x Glass. (Items Cost: 2500 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:02:42.608
cmlm1410z01drqo016pg67hso	cmllu00kw006xnw261mwscl7e	8	Acquired: 4x Wood, 4x Glass	CREDIT	RAW	2026-02-14 08:02:42.611
cmlm145kh01dtqo011evi43yd	cmllu01fk0071nw26rgvf2gft	-5000000	Converted 5000000 USD to IDR	DEBIT	USD	2026-02-14 08:02:48.408
cmlm145kh01dvqo01k8b186qj	cmllu01fk0071nw26rgvf2gft	93385000000	Received 93385000000 IDR from USD	CREDIT	IDR	2026-02-14 08:02:48.408
cmlm147t901dzqo01vvrbz785	cmllu0bxd0083nw26cle9wtdh	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:02:51.405
cmlm1494j01e1qo018xu306bs	cmllu0l6u008vnw26jnnl3z1k	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:02:53.104
cmlm1zgtb01w5qo01bwg0wbuv	cmllu02z70075nw267utb00t1	3520	Bulk Purchase: 10x Wood, 8x Coal. (Items Cost: 3520 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:27:09.407
cmlm1zgvw01w7qo01q19tewab	cmllu02z70075nw267utb00t1	18	Acquired: 10x Wood, 8x Coal	CREDIT	RAW	2026-02-14 08:27:09.5
cmlm1zqaz01w9qo01wzrmxp7e	cmllu0jsw008pnw26umu3i0fj	12200	Bulk Purchase: 61x Water. (Items Cost: 12200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:27:21.707
cmlm1zqb201wbqo0157ge6jxw	cmllu0jsw008pnw26umu3i0fj	61	Acquired: 61x Water	CREDIT	RAW	2026-02-14 08:27:21.71
cmlm20jju01wpqo011j9phic2	cmllu0bxd0083nw26cle9wtdh	24000	Bulk Purchase: 120x Water. (Items Cost: 24000 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:27:59.61
cmlm20jjx01wrqo01ze2bdwe1	cmllu0bxd0083nw26cle9wtdh	120	Acquired: 120x Water	CREDIT	RAW	2026-02-14 08:27:59.613
cmlm20r6m01wtqo0173c3s6q8	cmllu0bxd0083nw26cle9wtdh	200	Bulk Purchase: 1x Water. (Items Cost: 200 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:28:09.502
cmlm20r6n01wvqo01eucq2yyo	cmllu0bxd0083nw26cle9wtdh	1	Acquired: 1x Water	CREDIT	RAW	2026-02-14 08:28:09.504
cmlm2w5z00251qo01z60xb80q	cmllu06wy007jnw26xy0x6dn5	2700000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:52:35.004
cmlm12bg501chqo01yiu37lt9	cmllu00w3006znw26zc4y9ek0	2800	Sold 1x Ink for 2800 Eternites	CREDIT	CRAFT	2026-02-14 08:01:22.805
cmlm12czs01cpqo01yyn9v9i7	cmllu095j007vnw26ikcqk5fx	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:01:24.808
cmlm12d2901crqo01ngjhdk3b	cmllu095j007vnw26ikcqk5fx	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:01:24.897
cmlm12d2b01ctqo01xwemqcle	cmllu095j007vnw26ikcqk5fx	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:01:24.899
cmlm12d2c01cvqo01nufpswd0	cmllu095j007vnw26ikcqk5fx	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:01:24.9
cmlm12d2d01cxqo01ohm04lx1	cmllu095j007vnw26ikcqk5fx	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:01:24.901
cmlm13rav01ddqo0180ytlc47	cmllu0bxd0083nw26cle9wtdh	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:02:30.007
cmlm13rdi01dfqo01n30yzcil	cmllu0bxd0083nw26cle9wtdh	3	Bulk Crafted: 3x Pen	CREDIT	CRAFT	2026-02-14 08:02:30.102
cmlm13rdm01dhqo01i2ha5k5l	cmllu0bxd0083nw26cle9wtdh	30	Consumed 30x Wood for crafting	DEBIT	RAW	2026-02-14 08:02:30.106
cmlm13rg801djqo01s4xioqpp	cmllu0bxd0083nw26cle9wtdh	24	Consumed 24x Coal for crafting	DEBIT	RAW	2026-02-14 08:02:30.2
cmlm1471g01dxqo01mzcfyegg	cmllu0jsw008pnw26umu3i0fj	11020	Sold 38x Coal for 11020 Eternites	CREDIT	RAW	2026-02-14 08:02:50.404
cmlm14tf501e3qo01uty5x9zk	cmllu04r7007bnw26zxtj1wy7	1050	Sold 10x Wood for 1050 Eternites	CREDIT	RAW	2026-02-14 08:03:19.409
cmlm14tf501e5qo01rwjdk9x4	cmllu04r7007bnw26zxtj1wy7	5400	Sold 15x Metal for 5400 Eternites	CREDIT	RAW	2026-02-14 08:03:19.409
cmlm14wt501e7qo01w9uccy6u	cmllu0bdv0081nw26gpystvor	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:03:23.801
cmlm151jm01e9qo0138sq5rbi	cmlltzzt8006tnw26kuftz5q9	5565	Sold 53x Wood for 5565 Eternites	CREDIT	RAW	2026-02-14 08:03:29.938
cmlm152oa01ebqo0122og5wnj	cmllu02z70075nw267utb00t1	7821	Sold 5 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 08:03:31.401
cmlm152oa01edqo01oxbe65hb	cmllu02z70075nw267utb00t1	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 08:03:31.401
cmlm15ab901efqo019646kb3j	cmlltzvq60067nw26qemjfwxj	13335	Bulk Purchase: 127x Wood. (Items Cost: 13335 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:03:41.302
cmlm15abb01ehqo01ujlny5l4	cmlltzvq60067nw26qemjfwxj	127	Acquired: 127x Wood	CREDIT	RAW	2026-02-14 08:03:41.303
cmlm15hhp01ejqo010gzxtt6x	cmllu0bxd0083nw26cle9wtdh	16338	Sold 1 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 08:03:50.605
cmlm15hhq01elqo010bay53q3	cmllu0bxd0083nw26cle9wtdh	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 08:03:50.605
cmlm15r2901enqo01tjdcyq3q	cmllu0jsw008pnw26umu3i0fj	11235	Bulk Purchase: 107x Wood. (Items Cost: 11235 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:04:03.009
cmlm15r4r01epqo017fpvfeg6	cmllu0jsw008pnw26umu3i0fj	107	Acquired: 107x Wood	CREDIT	RAW	2026-02-14 08:04:03.1
cmlm162qa01erqo0120z7adi8	cmllu0ofe0099nw26n7luunss	1000	Blackmarket Fee	DEBIT	ETERNITES	2026-02-14 08:04:18.13
cmlm16hzd01etqo01yed6065y	cmllu0bdv0081nw26gpystvor	6475	Sold 2 items (BM Bulk)	CREDIT	ETERNITES	2026-02-14 08:04:37.813
cmlm16hze01evqo01flvanluw	cmllu0bdv0081nw26gpystvor	0	BM Transaction Fee (Sell)	DEBIT	ETERNITES	2026-02-14 08:04:37.813
cmlm174rg01exqo017j153hat	cmllu0bxd0083nw26cle9wtdh	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:05:07.42
cmlm1757s01f1qo011t26m15l	cmlltzzt8006tnw26kuftz5q9	4640	Bulk Purchase: 2x Glass, 10x Metal. (Items Cost: 4640 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:08.008
cmlm175aa01f3qo0110kc633j	cmlltzzt8006tnw26kuftz5q9	12	Acquired: 2x Glass, 10x Metal	CREDIT	RAW	2026-02-14 08:05:08.099
cmlm177on01f5qo0129nxhdw7	cmllu04r7007bnw26zxtj1wy7	6380	Bulk Purchase: 22x Coal. (Items Cost: 6380 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:11.207
cmlm177op01f7qo01ztfp8nqv	cmllu04r7007bnw26zxtj1wy7	22	Acquired: 22x Coal	CREDIT	RAW	2026-02-14 08:05:11.21
cmlm17mnb01f9qo01tnnlpc4z	cmllu0mw10093nw26ppcub6u6	105	Bulk Purchase: 1x Wood. (Items Cost: 105 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:30.599
cmlm17mne01fbqo01usyygd0p	cmllu0mw10093nw26ppcub6u6	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 08:05:30.602
cmlm181xh01ffqo018aqc33py	cmllu03le0077nw267n1s0mb6	3175	Bulk Purchase: 20x Wood, 5x Water. (Items Cost: 3175 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:50.406
cmlm181xk01fhqo01qcmhcina	cmllu03le0077nw267n1s0mb6	25	Acquired: 20x Wood, 5x Water	CREDIT	RAW	2026-02-14 08:05:50.408
cmlm183jt01flqo01m278s6xy	cmlltzwho006bnw2675cqbryr	1875	Sold 1x Brown Paper for 1875 Eternites	CREDIT	CRAFT	2026-02-14 08:05:52.505
cmlm187y201fnqo01qjpzqqyw	cmlltzzt8006tnw26kuftz5q9	780	Bulk Purchase: 4x Wood, 1x Metal. (Items Cost: 780 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:58.202
cmlm187y301fpqo01tpu8cvoj	cmlltzzt8006tnw26kuftz5q9	5	Acquired: 4x Wood, 1x Metal	CREDIT	RAW	2026-02-14 08:05:58.204
cmlm188g501frqo01s9wpsco6	cmllu0l6u008vnw26jnnl3z1k	10605	Bulk Purchase: 101x Wood. (Items Cost: 10605 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:05:58.853
cmlm188g601ftqo01l45ji13v	cmllu0l6u008vnw26jnnl3z1k	101	Acquired: 101x Wood	CREDIT	RAW	2026-02-14 08:05:58.854
cmlm18aki01fvqo01y5wpldt0	cmllu0i3k008jnw26vfsdew9m	4640	Sold 16x Coal for 4640 Eternites	CREDIT	RAW	2026-02-14 08:06:01.51
cmlm18d7p01fxqo015oiv9fsw	cmllu0fek0089nw26lw6emt67	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:06:05.029
cmlm18etb01fzqo016v6d813e	cmlltzzt8006tnw26kuftz5q9	105	Bulk Purchase: 1x Wood. (Items Cost: 105 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:06:07.103
cmlm18etc01g1qo017wni7ngk	cmlltzzt8006tnw26kuftz5q9	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 08:06:07.104
cmlm18tjx01g3qo01ixcy9e0c	cmllu0mw10093nw26ppcub6u6	105	Bulk Purchase: 1x Wood. (Items Cost: 105 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:06:26.205
cmlm18tjy01g5qo01k48fj8om	cmllu0mw10093nw26ppcub6u6	1	Acquired: 1x Wood	CREDIT	RAW	2026-02-14 08:06:26.207
cmlm18tmo01g9qo01eanyac00	cmllu0ep90087nw26uyzbvykl	1050	Bulk Purchase: 10x Wood. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:06:26.305
cmlm18tmp01gbqo01y4ippqlk	cmllu0ep90087nw26uyzbvykl	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:06:26.305
cmlm18whe01gdqo016l4vy9lf	cmlltzyhy006lnw26tbnvyy6x	4700000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 08:06:30
cmlm1951t01ghqo0160pm39wg	cmllu0bdv0081nw26gpystvor	1745	Bought 3 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:06:41.105
cmlm1951t01gjqo01z07s8cin	cmllu0bdv0081nw26gpystvor	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:06:41.105
cmlm199g101glqo01f1clk1cz	cmllu0gh8008dnw26sfpjylw0	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 08:06:46.71
cmlm19clm01gnqo01v6pqwv5e	cmlltzw6n0069nw266t9ghu5c	1040	Sold 2x Glass for 1040 Eternites	CREDIT	RAW	2026-02-14 08:06:50.891
cmlm19fjn01gpqo01lidhsq9i	cmllu0mw10093nw26ppcub6u6	2100	Bulk Purchase: 20x Wood. (Items Cost: 2100 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:06:54.708
cmlm19fjo01grqo01s738uxe5	cmllu0mw10093nw26ppcub6u6	20	Acquired: 20x Wood	CREDIT	RAW	2026-02-14 08:06:54.709
cmlm19g5p01gtqo012c5v5jh7	cmlltzyhy006lnw26tbnvyy6x	-4700000	Converted 4700000 USD to IDR	DEBIT	USD	2026-02-14 08:06:55.501
cmlm19g5q01gvqo01wkae2rga	cmlltzyhy006lnw26tbnvyy6x	87781900000	Received 87781900000 IDR from USD	CREDIT	IDR	2026-02-14 08:06:55.501
cmlm19ivc01gxqo01q6fc5c2o	cmllu0h0u008fnw2603crdwbl	4700000	Pitching Reward (USD)	CREDIT	USD	2026-02-14 08:06:59.016
cmlm19m9501h1qo019gp4r1xy	cmllu08or007tnw26wd6mv6wd	3600	Bulk Purchase: 10x Metal. (Items Cost: 3600 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:07:03.402
cmlm19m9601h3qo015l54t8w8	cmllu08or007tnw26wd6mv6wd	10	Acquired: 10x Metal	CREDIT	RAW	2026-02-14 08:07:03.403
cmlm19sky01h9qo01oq1dvx13	cmlltzwho006bnw2675cqbryr	1040	Bulk Purchase: 2x Glass. (Items Cost: 1040 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:07:11.603
cmlm19skz01hbqo01a9oj9sw6	cmlltzwho006bnw2675cqbryr	2	Acquired: 2x Glass	CREDIT	RAW	2026-02-14 08:07:11.604
cmlm19tz601hdqo017tlvt9bf	cmllu0kvl008tnw26fe8h34vp	1300	Thunt reward: 1300 Eternities	CREDIT	ETERNITES	2026-02-14 08:07:13.41
cmlm1a2i101hfqo011xuv0po1	cmllu06wy007jnw26xy0x6dn5	1500	Thunt reward: 1500 Eternities	CREDIT	ETERNITES	2026-02-14 08:07:24.457
cmlm1a83c01hhqo01dmxz73as	cmllu0bxd0083nw26cle9wtdh	15750	Bulk Purchase: 30x Wood, 35x Metal. (Items Cost: 15750 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:07:31.704
cmlm1a83d01hjqo019029l7d2	cmllu0bxd0083nw26cle9wtdh	65	Acquired: 30x Wood, 35x Metal	CREDIT	RAW	2026-02-14 08:07:31.705
cmlm1afqg01hpqo01usv1i0w3	cmllu06j7007hnw26uw0sp36v	4940	Bulk Purchase: 20x Wood, 2x Glass, 5x Metal. (Items Cost: 4940 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:07:41.609
cmlm1aft301hrqo01jal1b08r	cmllu06j7007hnw26uw0sp36v	27	Acquired: 20x Wood, 2x Glass, 5x Metal	CREDIT	RAW	2026-02-14 08:07:41.703
cmlm1avxq01hvqo01a4guj01x	cmllu0i3k008jnw26vfsdew9m	14505	Bulk Purchase: 1x Wood, 40x Metal. (Items Cost: 14505 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:08:02.607
cmlm1avxs01hxqo01bk4cdluy	cmllu0i3k008jnw26vfsdew9m	41	Acquired: 1x Wood, 40x Metal	CREDIT	RAW	2026-02-14 08:08:02.608
cmlm1b21a01ibqo01d121ixzp	cmllu02z70075nw267utb00t1	3370	Bulk Purchase: 10x Wood, 8x Coal. (Items Cost: 3370 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:08:10.51
cmlm1b21b01idqo01wktfxnz8	cmllu02z70075nw267utb00t1	18	Acquired: 10x Wood, 8x Coal	CREDIT	RAW	2026-02-14 08:08:10.511
cmlm20bwz01whqo016pbi32o1	cmllu02z70075nw267utb00t1	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:27:49.715
cmlm20bx101wjqo015hdujww5	cmllu02z70075nw267utb00t1	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 08:27:49.717
cmlm20bzd01wlqo01sq895onu	cmllu02z70075nw267utb00t1	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:27:49.801
cmlm20bze01wnqo01wqkxk5am	cmllu02z70075nw267utb00t1	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 08:27:49.803
cmlm20wny01wxqo0154d32ig1	cmllu004r006vnw263zlbwtzm	120	Sold 1x Wood for 120 Eternites	CREDIT	RAW	2026-02-14 08:28:16.606
cmlm21j1g01x3qo01nyrngqt2	cmllu0hmt008hnw26efktlnfg	2400	Sold 12x Water for 2400 Eternites	CREDIT	RAW	2026-02-14 08:28:45.604
cmlm21j1g01x5qo01js6nw9i2	cmllu0hmt008hnw26efktlnfg	2500	Sold 1x Brown Paper for 2500 Eternites	CREDIT	CRAFT	2026-02-14 08:28:45.604
cmlm22uvp01xlqo01montcdkk	cmllu0bdv0081nw26gpystvor	535	Sold 1x Glass for 535 Eternites	CREDIT	RAW	2026-02-14 08:29:47.605
cmlm22uvp01xnqo016wd9zcel	cmllu0bdv0081nw26gpystvor	580	Sold 2x Coal for 580 Eternites	CREDIT	RAW	2026-02-14 08:29:47.605
cmlm235ow01xrqo01caydr5ht	cmllu0fek0089nw26lw6emt67	5500	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:30:01.615
cmlm235ow01xtqo01ddmks0jv	cmllu0fek0089nw26lw6emt67	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:30:01.615
cmlm23ump01xvqo018j2d7e9a	cmllu01fk0071nw26rgvf2gft	700	Bought 1 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:30:33.937
cmlm23ump01xxqo01b7nlxeaj	cmllu01fk0071nw26rgvf2gft	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:30:33.937
cmlm19rt401h5qo010n6h050r	cmllu0fek0089nw26lw6emt67	1505	Sold 7x Water for 1505 Eternites	CREDIT	RAW	2026-02-14 08:07:10.6
cmlm1aows01htqo01kmr2azjf	cmllu082g007pnw26i9kqife7	105	Sold 1x Wood for 105 Eternites	CREDIT	RAW	2026-02-14 08:07:53.5
cmlm1aw3c01i1qo0155cj7qe8	cmlltzwho006bnw2675cqbryr	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:08:02.808
cmlm1aw3c01i3qo011yp7m3s6	cmlltzwho006bnw2675cqbryr	1	Bulk Crafted: 1x Magnifying Glass	CREDIT	CRAFT	2026-02-14 08:08:02.809
cmlm1aw3d01i5qo01xossn1rx	cmlltzwho006bnw2675cqbryr	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:08:02.81
cmlm1aw3e01i7qo01kus2vce7	cmlltzwho006bnw2675cqbryr	5	Consumed 5x Metal for crafting	DEBIT	RAW	2026-02-14 08:08:02.811
cmlm1aw3g01i9qo01h6sto65h	cmlltzwho006bnw2675cqbryr	2	Consumed 2x Glass for crafting	DEBIT	RAW	2026-02-14 08:08:02.813
cmlm1bbiy01ifqo011nlyb648	cmllu08or007tnw26wd6mv6wd	520	Bulk Purchase: 1x Glass. (Items Cost: 520 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:08:22.81
cmlm1bblg01ihqo01zwgslsj8	cmllu08or007tnw26wd6mv6wd	1	Acquired: 1x Glass	CREDIT	RAW	2026-02-14 08:08:22.9
cmlm1c2wv01ijqo01a5uebk63	cmllu0gh8008dnw26sfpjylw0	500	Exclusive News	DEBIT	ETERNITES	2026-02-14 08:08:58.303
cmlm1c38b01ilqo01vbtok818	cmllu0h0u008fnw2603crdwbl	-4700000	Converted 4700000 USD to IDR	DEBIT	USD	2026-02-14 08:08:58.715
cmlm1c38b01inqo015mem1vm5	cmllu0h0u008fnw2603crdwbl	87781900000	Received 87781900000 IDR from USD	CREDIT	IDR	2026-02-14 08:08:58.715
cmlm1cebw01ipqo01bwuapu3e	cmllu06j7007hnw26uw0sp36v	1050	Bulk Purchase: 10x Wood. (Items Cost: 1050 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:09:13.1
cmlm1cebz01irqo011ykb046x	cmllu06j7007hnw26uw0sp36v	10	Acquired: 10x Wood	CREDIT	RAW	2026-02-14 08:09:13.103
cmlm22ppl01xjqo012mez0qd7	cmlltzvq60067nw26qemjfwxj	31600000000	Pitching Reward (IDR)	CREDIT	IDR	2026-02-14 08:29:40.905
cmlm25buf01y7qo01wjcttjh1	cmllu08dp007rnw26v4dgmp23	600	Bulk Purchase: 3x Water. (Items Cost: 600 + Fee: 0)	DEBIT	ETERNITES	2026-02-14 08:31:42.904
cmlm25buh01y9qo01mcz6mttj	cmllu08dp007rnw26v4dgmp23	3	Acquired: 3x Water	CREDIT	RAW	2026-02-14 08:31:42.905
cmlm1cehm01ivqo01738lcm4m	cmllu0ofe0099nw26n7luunss	4675	Bought 2 items (BM Bulk)	DEBIT	ETERNITES	2026-02-14 08:09:13.305
cmlm1cehm01ixqo01rw6e9oup	cmllu0ofe0099nw26n7luunss	0	BM Transaction Fee (Buy)	DEBIT	ETERNITES	2026-02-14 08:09:13.305
cmlm1cgho01j1qo016895yug0	cmllu02z70075nw267utb00t1	500	Crafting Transaction Fee	DEBIT	ETERNITES	2026-02-14 08:09:15.9
cmlm1cghr01j3qo01tk4zm3pf	cmllu02z70075nw267utb00t1	1	Bulk Crafted: 1x Pen	CREDIT	CRAFT	2026-02-14 08:09:15.903
cmlm1cghr01j5qo01z61avpjl	cmllu02z70075nw267utb00t1	10	Consumed 10x Wood for crafting	DEBIT	RAW	2026-02-14 08:09:15.904
cmlm1cghs01j7qo010bykhwgy	cmllu02z70075nw267utb00t1	8	Consumed 8x Coal for crafting	DEBIT	RAW	2026-02-14 08:09:15.905
cmlm249nh01xzqo01tpr34h6g	cmllu0fek0089nw26lw6emt67	5885	Sold 11x Glass for 5885 Eternites	CREDIT	RAW	2026-02-14 08:30:53.405
cmlm252yv01y1qo01dlbf56br	cmllu09jj007xnw26irsp7nwv	1800	Sold 15x Wood for 1800 Eternites	CREDIT	RAW	2026-02-14 08:31:31.399
cmlm252yv01y3qo01119nveb5	cmllu09jj007xnw26irsp7nwv	790	Sold 2x Metal for 790 Eternites	CREDIT	RAW	2026-02-14 08:31:31.399
\.


--
-- Data for Name: CraftItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CraftItem" (id, name) FROM stdin;
1	Brown Paper
2	Pen
3	Magnifying Glass
4	Ink
5	Dividers
\.


--
-- Data for Name: CraftPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CraftPeriod" (id, "craftId", periode, price) FROM stdin;
cmlltznbn001cnw26mnejoxb0	1	1	2200
cmlltznbn001dnw26uwg82v4k	1	2	2400
cmlltznbn001enw269urjs84m	1	3	2000
cmlltznbn001fnw26it881zua	1	4	2100
cmlltznbn001gnw26kp8rfex0	1	5	2200
cmlltznbn001hnw26ay67z6qo	1	6	1875
cmlltznbn001inw26hn37x1rk	1	7	2500
cmlltznbn001jnw26vpp0ihq1	1	8	2550
cmlltznbn001knw26o1izpmz4	2	1	3300
cmlltznbn001lnw267120aphs	2	2	3550
cmlltznbn001mnw26yfi739mc	2	3	3600
cmlltznbn001nnw26uz8unigk	2	4	3000
cmlltznbn001onw267t5r3h1x	2	5	3100
cmlltznbn001pnw26za70gozu	2	6	3550
cmlltznbn001qnw261kjjzyes	2	7	3700
cmlltznbn001rnw260nh5o2wp	2	8	3450
cmlltznbn001snw26vf5wo3xp	3	1	4025
cmlltznbn001tnw26b3dc18o1	3	2	4450
cmlltznbn001unw264w8sqmdk	3	3	4450
cmlltznbn001vnw26wxequjvq	3	4	4200
cmlltznbn001wnw26zj5rv3jk	3	5	4000
cmlltznbn001xnw263cecrc1z	3	6	3700
cmlltznbn001ynw266obfyowg	3	7	4300
cmlltznbn001znw26stuodtqz	3	8	4000
cmlltznbn0020nw26owa1slh9	4	1	2650
cmlltznbn0021nw26h3wa78m9	4	2	2850
cmlltznbn0022nw265tdlh1rd	4	3	2300
cmlltznbn0023nw26i2lqm8y0	4	4	2000
cmlltznbn0024nw26acsx2qzy	4	5	2350
cmlltznbn0025nw26r6cttswk	4	6	2800
cmlltznbn0026nw26vlbmxy28	4	7	2500
cmlltznbn0027nw266tuww40c	4	8	2600
cmlltznbn0028nw26jfzi8hqo	5	1	3575
cmlltznbn0029nw26nu4eonre	5	2	3900
cmlltznbn002anw26pqbyfasl	5	3	4000
cmlltznbn002bnw26kbch1zjg	5	4	4100
cmlltznbn002cnw26l77thi74	5	5	3950
cmlltznbn002dnw26ckgv8imn	5	6	3250
cmlltznbn002enw266gn5xyfd	5	7	3800
cmlltznbn002fnw263r29hs2t	5	8	3600
\.


--
-- Data for Name: CraftRecipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CraftRecipe" (id, "craftItemId", "rawItemId", amount) FROM stdin;
cmlltznur004vnw26rbpdrnsn	1	1	10
cmlltznur004wnw267q85te4s	1	3	5
cmlltznur004xnw26ubyc4yyr	2	1	10
cmlltznur004ynw266w2iaaeo	2	4	8
cmlltznur004znw265zu9zr09	3	1	10
cmlltznur0050nw268wnvfxxi	3	5	5
cmlltznur0051nw26zz4dy20u	3	2	2
cmlltznur0052nw26lukb8fbc	4	3	7
cmlltznur0053nw2687c3nj3z	4	4	4
cmlltznur0054nw26nejwycgj	5	1	15
cmlltznur0055nw26gy5qn1qw	5	5	5
\.


--
-- Data for Name: CraftStockPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CraftStockPeriod" (id, "craftId", stock, periode, price) FROM stdin;
cmlltznpa003rnw26iqj97jk7	1	2	1	2250
cmlltznpa003snw26rp0sniqq	2	1	1	3500
cmlltznpa003unw264cv9zvrj	4	3	1	3000
cmlltznpa003wnw26et9aic1a	1	5	2	2500
cmlltznpa003xnw2646m3gg71	2	1	2	5000
cmlltznpa003znw26rfbf1na4	4	4	2	3500
cmlltznpa0041nw265tixtrm8	1	3	3	4500
cmlltznpa0042nw268kp6drc7	2	3	3	8500
cmlltznpa0043nw26vvcbvpfy	3	2	3	8000
cmlltznpa0044nw26b0b7xqhw	4	3	3	6000
cmlltznpa0045nw26sptpzivb	5	4	3	5500
cmlltznpa0047nw26bb3oz4gy	2	1	4	7500
cmlltznpa0048nw26ln42sded	3	5	4	7000
cmlltznpa0049nw263zmfzlgo	4	3	4	5750
cmlltznpa004bnw26v7ngbz1p	1	4	5	2000
cmlltznpa004cnw26ivknyspd	2	4	5	3500
cmlltznpa004dnw26sscvwuwd	3	3	5	3200
cmlltznpa004enw269zta8vfv	4	3	5	2500
cmlltznpa004fnw26issysffz	5	3	5	2250
cmlltznpa004gnw26sln1ecsb	1	1	6	2975
cmlltznpa004hnw26wqn3gmgo	2	2	6	5446
cmlltznpa004inw26ios2fykw	3	2	6	4725
cmlltznpa004jnw26ir4ytp5x	4	1	6	4718
cmlltznpa004knw26zrg9kdbx	5	5	6	3731
cmlltznpa004mnw26qb5djar4	2	4	7	4000
cmlltznpa004qnw2635031wzv	1	1	8	5000
cmlltznpa004rnw26m3jxzj5t	2	1	8	10000
cmlltznrs004snw26s4d7mjgb	3	1	8	9500
cmlltznrs004tnw26wqk0yv8n	4	1	8	7000
cmlltznrs004unw26dj1f75mr	5	1	8	7000
cmlltznpa003vnw26y58jx04o	5	2	1	2000
cmlltznpa003tnw26127dmglw	3	2	1	3000
cmlltznpa0040nw26qgd47skw	5	3	2	2500
cmlltznpa003ynw265ynlgjt4	3	1	2	3500
cmlltznpa0046nw26tvn3felb	1	4	4	4750
cmlltznpa004anw26b6rtm34q	5	4	4	4500
cmlltznpa004pnw26q9qo4ns7	5	0	7	2000
cmlltznpa004nnw261zj05yye	3	0	7	3500
cmlltznpa004lnw26nqj8c7iu	1	0	7	2000
cmlltznpa004onw26t3up0vnc	4	0	7	3000
\.


--
-- Data for Name: CraftUserAmount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CraftUserAmount" (id, "tradingDataId", "craftItemId", amount) FROM stdin;
cmlm0k096013pqo01y0z8eo3v	cmllu01fk0071nw26rgvf2gft	3	0
cmlm07v2500xtqo0182rk3961	cmlltzvq60067nw26qemjfwxj	1	0
cmllzrbri00q1qo01k9g9sfsh	cmllu06j7007hnw26uw0sp36v	4	0
cmlm0wqwo019hqo016kg9bsxr	cmllu06j7007hnw26uw0sp36v	2	0
cmllwutc700bdqv01lbiwlvlf	cmllu00w3006znw26zc4y9ek0	4	0
cmllwjpnm001vqv01srj7s5su	cmllu00w3006znw26zc4y9ek0	1	0
cmllxxdgi003jqo01st16krrc	cmllu095j007vnw26ikcqk5fx	4	0
cmlm004fm00ubqo01kkg69o1b	cmllu0bdv0081nw26gpystvor	1	0
cmlm1aw3801hzqo01sdveruut	cmlltzwho006bnw2675cqbryr	3	0
cmlm0hqrm011tqo017wd4i129	cmlltzwho006bnw2675cqbryr	1	0
cmllypzpj002rqo01bk0207wh	cmlltzyqo006nnw26bdi47ek8	3	0
cmllzrjhf00qfqo016994eq9v	cmllu02a60073nw26f5vv4wcw	1	0
cmllwy48u00d9qv01ss82v5e3	cmllu02a60073nw26f5vv4wcw	3	0
cmllyuicu005pqo01q9e4ixvh	cmlltzw6n0069nw266t9ghu5c	3	0
cmlm0tie50187qo013uoamx5m	cmllu07dj007lnw261urdgi6e	1	0
cmllzm20v00l7qo01dale32ez	cmlltzw6n0069nw266t9ghu5c	4	0
cmllwkqzr0037qv01pxk4h7xd	cmlltzxsz006hnw267qcl5gqp	1	0
cmlm04pek00vxqo01hnawn22z	cmllu0j14008nnw269ihx0pxl	1	0
cmlm0n1fq015lqo013pkhx509	cmlltzzi0006rnw2673ipn4ol	1	0
cmlm0n1la015nqo01nxoywrlg	cmlltzzi0006rnw2673ipn4ol	2	0
cmlm0n1o2015rqo01ju7s1up7	cmlltzzi0006rnw2673ipn4ol	4	0
cmllx6sip00ifqv01xjwwzx7j	cmlltzzi0006rnw2673ipn4ol	5	0
cmlm0n1lg015pqo01f83fmhmk	cmlltzzi0006rnw2673ipn4ol	3	0
cmllz3a9b00a3qo01c0kbk76c	cmllu05wr007fnw263pcca89z	1	0
cmllx57kl00hnqv015dvtt3s7	cmllu03le0077nw267n1s0mb6	3	0
cmllzn1al00mnqo01pr380r5d	cmllu03le0077nw267n1s0mb6	2	0
cmllx4qix00hdqv01qgvj4v92	cmllu08or007tnw26wd6mv6wd	1	0
cmllx7yn100ixqv01gdmhtr8s	cmllu0hmt008hnw26efktlnfg	1	0
cmlm1oc1j01ovqo01n3kwk5y0	cmllu044s0079nw26frbt1r2i	4	0
cmllx3v6m00h1qv01pcxn0543	cmllu04r7007bnw26zxtj1wy7	1	0
cmllwxjvp00cvqv01j7bqsmif	cmllu0bxd0083nw26cle9wtdh	3	0
cmlm2l0ta022nqo01fvgdlpz7	cmllu0bxd0083nw26cle9wtdh	4	0
cmllybhxx000nqo01yltdouqc	cmllu05ad007dnw26h2vqc9kh	5	0
cmllwlp3l004bqv01bc8y4siq	cmllu0gh8008dnw26sfpjylw0	3	0
cmlly7kw70001qo01ar0t1ax8	cmllu0gh8008dnw26sfpjylw0	5	0
cmllyq9no003fqo01r58arcoe	cmllu0dry0085nw26fee82749	1	0
cmllzkxaj00jzqo012bi21ss4	cmllu02z70075nw267utb00t1	1	0
cmlm1cgez01izqo01konsxor3	cmllu02z70075nw267utb00t1	2	0
cmlm1kziq01mrqo01d7bkra7r	cmllu03le0077nw267n1s0mb6	1	0
cmlm1lj1l01n5qo01vmnk37zo	cmllu06j7007hnw26uw0sp36v	1	0
cmlm1lj4701n7qo012l0tvc3w	cmllu06j7007hnw26uw0sp36v	3	0
cmllzkbg600j7qo01fanfgbnj	cmllu095j007vnw26ikcqk5fx	1	0
cmlm0i9wk012dqo01k2fy21vp	cmllu095j007vnw26ikcqk5fx	2	0
cmlm12czq01cnqo01jakcivv2	cmllu095j007vnw26ikcqk5fx	3	0
cmllwxjvp00ctqv01ztzo4w6a	cmllu0bxd0083nw26cle9wtdh	5	0
cmlm1tyd101s7qo0186jitlqg	cmllu0bxd0083nw26cle9wtdh	1	0
cmlm13r8001dbqo01thzpkc5w	cmllu0bxd0083nw26cle9wtdh	2	0
cmllyslga004nqo01mvebwte5	cmllu06wy007jnw26xy0x6dn5	3	0
cmllxh64f00l1qv012lac1r6h	cmllu06wy007jnw26xy0x6dn5	2	0
cmllzh2vc00gzqo01xwapb9nc	cmlltzy4f006jnw264h8kyavc	1	0
cmlm0xy9n01a3qo01tmaz2frr	cmlltzy4f006jnw264h8kyavc	2	0
cmllygxs3000zqo01mzg2pe4i	cmllu02z70075nw267utb00t1	3	0
cmllzkxaj00k1qo01qz57hu2m	cmllu02z70075nw267utb00t1	5	0
cmllzo2mz00ndqo01qo3wh5om	cmlltzz1o006pnw26ztynyxv4	5	0
cmlm1pc8701pnqo01llpmgei1	cmlltzz1o006pnw26ztynyxv4	3	0
cmlm1xnrj01uzqo017lp3ml0l	cmllu0ik5008lnw26o95uvsly	3	0
cmlm1wpa401u3qo01bm0aizxz	cmllu07os007nnw2657lw1mt3	4	0
cmlm2bwsz020rqo01avxq4z56	cmllu0dry0085nw26fee82749	5	0
cmllyq9yy003hqo014rr4v5c5	cmllu0dry0085nw26fee82749	2	0
cmllyqaie003pqo01qe983k5k	cmllu0dry0085nw26fee82749	3	0
cmlm1wk9h01tpqo0179veo9es	cmllu00kw006xnw261mwscl7e	1	0
\.


--
-- Data for Name: MapRecipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MapRecipe" (id) FROM stdin;
cmlltzne6002gnw26qbzv1wpf
\.


--
-- Data for Name: MapRecipeComponent; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MapRecipeComponent" (id, amount, "mapRecipeId", "craftItemId") FROM stdin;
cmlltzne7002inw264rzb883y	3	cmlltzne6002gnw26qbzv1wpf	1
cmlltzne7002jnw260oaai3w6	1	cmlltzne6002gnw26qbzv1wpf	2
cmlltzne7002knw26jlo9f9pp	2	cmlltzne6002gnw26qbzv1wpf	4
cmlltzne7002lnw26phg1zpn1	1	cmlltzne6002gnw26qbzv1wpf	5
cmlltzne7002mnw263a8391yd	1	cmlltzne6002gnw26qbzv1wpf	3
\.


--
-- Data for Name: MasterTrading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MasterTrading" (id, current_periode) FROM stdin;
tradingMasterData@Eternity	1
\.


--
-- Data for Name: PeriodeTrading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PeriodeTrading" (id, periode, cost_map, price_map, duration, "endTime", "pausedTime", "startTime", status, "totalPausedDuration", usdidr_rate, news) FROM stdin;
cmlltzmxf0006nw26oubv9bvl	7	2800	108000000000	20	2026-02-14 08:32:13.902	\N	2026-02-14 08:12:13.706	ENDED	0	17743	Stabilitas ekonomi semakin menguat seiring meningkatnya pembangunan dan kepercayaan terhadap kondisi domestik.
cmlltzmxf0002nw26lp5vimjr	3	1600	116000000000	20	2026-02-14 07:10:59.285	\N	2026-02-14 06:48:00.185	ENDED	177300	15989	Musim hujan melanda berbagai wilayah, memengaruhi kelancaran aktivitas ekonomi dan distribusi serta meningkatkan ketidakpastian dalam perencanaan operasional.
cmlltzmxf0003nw26q4u2w7b6	4	1900	114000000000	20	2026-02-14 07:29:52.659	\N	2026-02-14 07:12:16.68	ENDED	0	16628	Keadaan darurat menggeser fokus ekonomi dari pertumbuhan menuju respons cepat dan pemulihan infrastruktur penting.
cmlltzmxf0001nw26e8i2c7xn	2	1300	118000000000	20	2026-02-14 06:45:59.482	\N	2026-02-14 06:20:18.78	ENDED	338904	16830	Kenaikan pajak mulai memengaruhi iklim ekonomi, meningkatkan tekanan biaya dan mengubah perilaku pelaku pasar dalam menjalankan aktivitas produksi dan distribusi.
cmlltzmxf0004nw26m1llogjq	5	2200	112000000000	20	2026-02-14 07:50:01.302	\N	2026-02-14 07:30:00.59	ENDED	0	17293	Banjir surut, masa pemulihan mulai terbentuk, ditandai dengan upaya penyeimbangan kembali aktivitas ekonomi setelah periode gangguan besar.
cmlltzmxf0007nw267mpmkm90	8	3100	106000000000	20	2026-02-14 09:05:01.498	\N	2026-02-14 08:32:38.904	ENDED	0	15969	Gunung berapi meletus dan memicu gangguan pada lingkungan serta aktivitas ekonomi
cmlltzmxf0005nw26drq6chc4	6	2500	110000000000	20	2026-02-14 08:11:45.309	\N	2026-02-14 07:51:45.001	ENDED	0	18677	Aktivitas industri kembali bergerak dinamis, namun ketidakseimbangan struktural menciptakan persaingan dan tekanan operasional.
cmlltzmxf0000nw26liwo3fr7	1	1000	120000000000	200	2026-02-14 12:50:06.475	\N	2026-02-14 09:30:06.475	ON_GOING	0	16500	Dunia berada dalam kondisi stabil dan kondusif, dengan aktivitas ekonomi berjalan normal serta lingkungan yang mendukung perencanaan jangka panjang.
\.


--
-- Data for Name: RallyActivityLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyActivityLog" (id, message, "createdAt", user_id) FROM stdin;
\.


--
-- Data for Name: RallyBigItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyBigItem" (id, name) FROM stdin;
1	Eternia Sigil
2	Chrono Key
3	Core Fragment
\.


--
-- Data for Name: RallyBigItemRecipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyBigItemRecipe" (id, result_item_id, small_item_id, quantity) FROM stdin;
cmllu1cqj00k2nw2660ljcync	1	1	1
cmllu1cqj00k3nw26mld2pqxx	1	5	2
cmllu1cqj00k4nw267rviffpd	2	2	1
cmllu1cqj00k5nw26kzia0o38	2	4	2
cmllu1cqj00k6nw26if9ani39	3	3	1
cmllu1cqj00k7nw26580il5h5	3	6	2
\.


--
-- Data for Name: RallyData; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyData" (id, point, vault, ticket, access_card_level, enonix, minus_point, special_ticket, user_id, level_upgrade_cost_id, pos_visited_count) FROM stdin;
cmlltzo8x0057nw265k17igqd	0	0	0	0	0	0	0	cmlltzo8t0056nw26qzcjztes	1	0
cmlltzopa0059nw260b63jn26	0	0	0	0	0	0	0	cmlltzop40058nw268s1gbhyb	1	0
cmlltzp0g005bnw26u6ks0c9m	0	0	0	0	0	0	0	cmlltzp0d005anw26v7bb6lyh	1	0
cmlltzpeg005dnw26j958rdnz	0	0	0	0	0	0	0	cmlltzpea005cnw26ce5uth4a	1	0
cmlltzppf005fnw26cnxfqz08	0	0	0	0	0	0	0	cmlltzppa005enw26j7jbpehl	1	0
cmlltzq3a005hnw26mrngpq7w	0	0	0	0	0	0	0	cmlltzq0k005gnw26sas5i763	1	0
cmlltzqpe005jnw26g0o7scl6	0	0	0	0	0	0	0	cmlltzqn1005inw26o781yll8	1	0
cmlltzr0j005lnw261e1iku2e	0	0	0	0	0	0	0	cmlltzqy7005knw26t3wiidf2	1	0
cmlltzreq005nnw26xbgtqvzy	0	0	0	0	0	0	0	cmlltzrei005mnw26ki00k7h8	1	0
cmlltzs0q005pnw26l7vqag7z	0	0	0	0	0	0	0	cmlltzs0n005onw26vzoy9dw8	1	0
cmlltzsmx005rnw26k50oppz5	0	0	0	0	0	0	0	cmlltzska005qnw26s6id6alz	1	0
cmlltzt0s005tnw26vwyrlawo	0	0	0	0	0	0	0	cmlltzt0p005snw26gqajjfcb	1	0
cmlltzthi005vnw26oagxvtgy	0	0	0	0	0	0	0	cmlltzthg005unw26v70011gk	1	0
cmlltztvh005xnw26vz172td8	0	0	0	0	0	0	0	cmlltztve005wnw2613gjtm2l	1	0
cmlltzu96005znw26sa04lfbx	0	0	0	0	0	0	0	cmlltzu6q005ynw26jvent5e3	1	0
cmlltzun20061nw26rrcvt0op	0	0	0	0	0	0	0	cmlltzukg0060nw26heu6a6l2	1	0
\.


--
-- Data for Name: RallyMaster; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyMaster" (id, current_period_id, special_ticket_stock, total_period) FROM stdin;
\.


--
-- Data for Name: RallyPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyPeriod" (id, name, duration, status, "endTime", "pausedTime", "startTime", "totalPausedDuration", special_ticket_name, special_ticket_stock) FROM stdin;
1	Pasang Surut	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Pasang Surut	5
2	Musim Kemarau	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Musim Kemarau	5
3	Musim Salju	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Musim Salju	5
4	Banjir	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Banjir	5
5	Bulan Merah	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Bulan Merah	5
6	Cuaca Cerah	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Cuaca Cerah	5
7	Hujan Asam	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Hujan Asam	5
8	Tornado	20	NOT_STARTED	\N	\N	\N	0	Special Ticket Tornado	5
\.


--
-- Data for Name: RallyPos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyPos" (id, period_id, zone_id, eonix_cost, name) FROM stdin;
cmllu1cfi00c2nw26e89hsrcq	1	1	2	Ledger Of Balance
cmllu1cfi00c3nw263mt64akk	2	1	2	Ledger Of Balance
cmllu1cfi00c4nw26nei7fhlg	3	1	3	Ledger Of Balance
cmllu1cfi00c5nw269rt9dneu	4	1	4	Ledger Of Balance
cmllu1cfi00c6nw26cipsogaj	5	1	2	Ledger Of Balance
cmllu1cfi00c7nw26fxnepqdl	6	1	3	Ledger Of Balance
cmllu1cfi00c8nw26p6vkqfvt	7	1	4	Ledger Of Balance
cmllu1cfi00c9nw2690vbbltx	8	1	3	Ledger Of Balance
cmllu1cfi00canw26r3dzp9j1	1	1	2	Spell Station
cmllu1cfi00cbnw26c6y5jnqd	2	1	2	Spell Station
cmllu1cfi00ccnw26fj2mwqd1	3	1	3	Spell Station
cmllu1cfi00cdnw26bhz2jzas	4	1	4	Spell Station
cmllu1cfi00cenw26y6dnf4u0	5	1	2	Spell Station
cmllu1cfi00cfnw26bxpf41a1	6	1	3	Spell Station
cmllu1cfi00cgnw261xth0o7k	7	1	4	Spell Station
cmllu1cfi00chnw26e8dzc959	8	1	3	Spell Station
cmllu1cfi00cinw260ta8fynw	1	1	2	Word Bridge
cmllu1cfi00cjnw263f0lghbt	2	1	2	Word Bridge
cmllu1cfi00cknw26o3e66bkz	3	1	3	Word Bridge
cmllu1cfi00clnw267s5p6v15	4	1	4	Word Bridge
cmllu1cfi00cmnw26xoect1nd	5	1	2	Word Bridge
cmllu1cfi00cnnw260gdvo6d0	6	1	3	Word Bridge
cmllu1cfi00conw26eikrywl7	7	1	4	Word Bridge
cmllu1cfi00cpnw26qbodih5i	8	1	3	Word Bridge
cmllu1cfi00cqnw26n5la8ttf	1	1	2	Count The Pion
cmllu1cfi00crnw26rkjf7k46	2	1	2	Count The Pion
cmllu1cfi00csnw26lk1g4edv	3	1	3	Count The Pion
cmllu1cfi00ctnw263gf0z09s	4	1	4	Count The Pion
cmllu1cfi00cunw26334cf66n	5	1	2	Count The Pion
cmllu1cfi00cvnw26ivzoiba3	6	1	3	Count The Pion
cmllu1cfi00cwnw26itzy3k6d	7	1	4	Count The Pion
cmllu1cfi00cxnw26au3rmoz6	8	1	3	Count The Pion
cmllu1cfi00cynw26g5pnxr1k	1	1	2	Create Your Story
cmllu1cfi00cznw26ompexs7d	2	1	2	Create Your Story
cmllu1cfi00d0nw260hogy18v	3	1	3	Create Your Story
cmllu1cfi00d1nw265je9m3vr	4	1	4	Create Your Story
cmllu1cfi00d2nw266jpurquq	5	1	2	Create Your Story
cmllu1cfi00d3nw26isvh9166	6	1	3	Create Your Story
cmllu1cfi00d4nw26f9y41elz	7	1	4	Create Your Story
cmllu1cfi00d5nw26x7flf64z	8	1	3	Create Your Story
cmllu1cfi00d6nw26fguz212q	1	1	2	Charades
cmllu1cfi00d7nw26ps3nczld	2	1	2	Charades
cmllu1cfi00d8nw268m4tfrdc	3	1	3	Charades
cmllu1cfi00d9nw26xz9rdoyz	4	1	4	Charades
cmllu1cfi00danw268zpjga3z	5	1	2	Charades
cmllu1cfi00dbnw26p9lgexgi	6	1	3	Charades
cmllu1cfi00dcnw26oxdikqyc	7	1	4	Charades
cmllu1cfi00ddnw26c6ptv7fn	8	1	3	Charades
cmllu1cfi00denw26b2acezw5	1	1	2	Memory Run
cmllu1cfi00dfnw26pf5ju1ye	2	1	2	Memory Run
cmllu1cfi00dgnw26y8y1d90j	3	1	3	Memory Run
cmllu1cfi00dhnw26ufeilxnq	4	1	4	Memory Run
cmllu1cfi00dinw265vl75m5s	5	1	2	Memory Run
cmllu1cfi00djnw26sop968gg	6	1	3	Memory Run
cmllu1cfi00dknw26gxlg3gx1	7	1	4	Memory Run
cmllu1cfi00dlnw26squgnu3v	8	1	3	Memory Run
cmllu1cfi00dmnw26nspeyskr	1	1	2	Find The Ball
cmllu1cfj00dnnw267tbt1n6l	2	1	2	Find The Ball
cmllu1cfj00donw26bnby9hct	3	1	3	Find The Ball
cmllu1cfj00dpnw26ri58wfca	4	1	4	Find The Ball
cmllu1cfj00dqnw267fiqe797	5	1	2	Find The Ball
cmllu1cfj00drnw26lwcgwnii	6	1	3	Find The Ball
cmllu1cfj00dsnw26u8x30uui	7	1	4	Find The Ball
cmllu1cfj00dtnw267hhjxg3v	8	1	3	Find The Ball
cmllu1cfj00dunw26tshmqnb4	1	1	2	Drawing Relay
cmllu1cfj00dvnw266sgmeq40	2	1	2	Drawing Relay
cmllu1cfj00dwnw260cyi5xdy	3	1	3	Drawing Relay
cmllu1cfj00dxnw260rrhk42f	4	1	4	Drawing Relay
cmllu1cfj00dynw26d99eefm2	5	1	2	Drawing Relay
cmllu1cfj00dznw26gsvw4d1o	6	1	3	Drawing Relay
cmllu1cfj00e0nw26qi0mro16	7	1	4	Drawing Relay
cmllu1cfj00e1nw26pz5u39tm	8	1	3	Drawing Relay
cmllu1cfj00e2nw26t8uy9aq0	1	1	2	Flip It
cmllu1cfj00e3nw260imwvtp5	2	1	2	Flip It
cmllu1cfj00e4nw26nnu2x0ok	3	1	3	Flip It
cmllu1cfj00e5nw26ptolui42	4	1	4	Flip It
cmllu1cfj00e6nw26mykexm52	5	1	2	Flip It
cmllu1cfj00e7nw26qnkybh1n	6	1	3	Flip It
cmllu1cfj00e8nw262ldv3kai	7	1	4	Flip It
cmllu1cfj00e9nw262w1erj2i	8	1	3	Flip It
cmllu1cfj00eanw26ttcx31hn	1	1	2	Make The Tower
cmllu1cfj00ebnw26v3nxzsxl	2	1	2	Make The Tower
cmllu1cfj00ecnw26x1rvyw2e	3	1	3	Make The Tower
cmllu1cfj00ednw267ovj7iqs	4	1	4	Make The Tower
cmllu1cfj00eenw26h4kong5b	5	1	2	Make The Tower
cmllu1cfj00efnw26hs6sus1j	6	1	3	Make The Tower
cmllu1cfj00egnw269ljpwday	7	1	4	Make The Tower
cmllu1cfj00ehnw26v4jmtb7f	8	1	3	Make The Tower
cmllu1cfj00einw26qmwf76o0	1	2	3	Trivia Quiz
cmllu1cfj00ejnw26vvyxtyu6	2	2	2	Trivia Quiz
cmllu1cfj00eknw26xw4o9aqt	3	2	4	Trivia Quiz
cmllu1cfj00elnw2641v6xmpu	4	2	2	Trivia Quiz
cmllu1cfj00emnw26rqwrfu3i	5	2	2	Trivia Quiz
cmllu1cfj00ennw26qqom8xwo	6	2	3	Trivia Quiz
cmllu1cfj00eonw26glta3q8n	7	2	3	Trivia Quiz
cmllu1cfj00epnw260kdweqex	8	2	2	Trivia Quiz
cmllu1cfj00eqnw260o7421eh	1	2	3	Guess The Order
cmllu1cfj00ernw26wm3ucmma	2	2	2	Guess The Order
cmllu1cfj00esnw26thuzgm0s	3	2	4	Guess The Order
cmllu1cfj00etnw26cfy7s6cd	4	2	2	Guess The Order
cmllu1cfj00eunw268ne5qa17	5	2	2	Guess The Order
cmllu1cfj00evnw26jb21a4vj	6	2	3	Guess The Order
cmllu1cfj00ewnw26eifo7ies	7	2	3	Guess The Order
cmllu1cfj00exnw26wv80annf	8	2	2	Guess The Order
cmllu1cfj00eynw26brpxyosl	1	2	3	Stack Board
cmllu1cfj00eznw266jc2yhwz	2	2	2	Stack Board
cmllu1cfj00f0nw26zj15wazs	3	2	4	Stack Board
cmllu1cfj00f1nw26c3gvl0aa	4	2	2	Stack Board
cmllu1cfj00f2nw26hbp3ne95	5	2	2	Stack Board
cmllu1cfj00f3nw26cz33e3g8	6	2	3	Stack Board
cmllu1cfj00f4nw26pzsuppc9	7	2	3	Stack Board
cmllu1cfj00f5nw26pyl3qnm7	8	2	2	Stack Board
cmllu1cfj00f6nw26yaihy03t	1	2	3	Leading The Blind
cmllu1cfj00f7nw26543bktba	2	2	2	Leading The Blind
cmllu1cfj00f8nw26pswwcmps	3	2	4	Leading The Blind
cmllu1cfj00f9nw26bu8gjt1w	4	2	2	Leading The Blind
cmllu1cfj00fanw26se8fcbmx	5	2	2	Leading The Blind
cmllu1cfj00fbnw26g4ah6jft	6	2	3	Leading The Blind
cmllu1cfj00fcnw262fatta1t	7	2	3	Leading The Blind
cmllu1cfj00fdnw26lge5zoj4	8	2	2	Leading The Blind
cmllu1cfj00fenw26lvuh68fj	1	2	3	Lava Floor
cmllu1cfj00ffnw26fwc1sw1v	2	2	2	Lava Floor
cmllu1cfj00fgnw26y4p8z75d	3	2	4	Lava Floor
cmllu1cfj00fhnw26y9xm4fxv	4	2	2	Lava Floor
cmllu1cfj00finw26jszi3hic	5	2	2	Lava Floor
cmllu1cfj00fjnw26vccbfam2	6	2	3	Lava Floor
cmllu1cfj00fknw2651ke9kzs	7	2	3	Lava Floor
cmllu1cfj00flnw26f00n5x5n	8	2	2	Lava Floor
cmllu1cfj00fmnw26gvzyte37	1	2	3	Running Man
cmllu1cfj00fnnw26pi2v8y6a	2	2	2	Running Man
cmllu1cfj00fonw26avxsb7ol	3	2	4	Running Man
cmllu1cfj00fpnw26jflzs6w2	4	2	2	Running Man
cmllu1cfj00fqnw261ccl9x7y	5	2	2	Running Man
cmllu1cfj00frnw26g55610ys	6	2	3	Running Man
cmllu1cfj00fsnw266fn05k4s	7	2	3	Running Man
cmllu1cfj00ftnw268h7c42ev	8	2	2	Running Man
cmllu1cfj00funw26vfamqu6b	1	2	3	Guess The Song
cmllu1cfj00fvnw26dzwbhdr3	2	2	2	Guess The Song
cmllu1cfj00fwnw26urgo016a	3	2	4	Guess The Song
cmllu1cfj00fxnw26vp7hh6s1	4	2	2	Guess The Song
cmllu1cfj00fynw26moydhwnp	5	2	2	Guess The Song
cmllu1cfj00fznw268l52fng7	6	2	3	Guess The Song
cmllu1cfj00g0nw26y0loxc5u	7	2	3	Guess The Song
cmllu1cfj00g1nw26ee0gppi2	8	2	2	Guess The Song
cmllu1cfj00g2nw26te4wsfr1	1	2	3	Let Those Out
cmllu1cfj00g3nw26rkwib8nx	2	2	2	Let Those Out
cmllu1cfj00g4nw2633np53mw	3	2	4	Let Those Out
cmllu1cfj00g5nw263fvaltgc	4	2	2	Let Those Out
cmllu1cfj00g6nw267uv2qrq0	5	2	2	Let Those Out
cmllu1cfj00g7nw2614vsl68w	6	2	3	Let Those Out
cmllu1cfj00g8nw264dob2lht	7	2	3	Let Those Out
cmllu1cfj00g9nw268t30e4ss	8	2	2	Let Those Out
cmllu1cfj00ganw269fhnhv0j	1	3	2	Fly Cup, Fly
cmllu1cfj00gbnw26ofnyptke	2	3	3	Fly Cup, Fly
cmllu1cfj00gcnw2664hhthjz	3	3	3	Fly Cup, Fly
cmllu1cfj00gdnw266mub5eva	4	3	3	Fly Cup, Fly
cmllu1cfj00genw268cgh18c6	5	3	3	Fly Cup, Fly
cmllu1cfj00gfnw26wxbse79z	6	3	4	Fly Cup, Fly
cmllu1cfj00ggnw2669r6rl2o	7	3	2	Fly Cup, Fly
cmllu1cfj00ghnw26546tz0e3	8	3	2	Fly Cup, Fly
cmllu1chy00ginw264xii1rqr	1	3	2	Estafet Gelas
cmllu1chy00gjnw26ty3xyy1c	2	3	3	Estafet Gelas
cmllu1chy00gknw269qavg5ha	3	3	3	Estafet Gelas
cmllu1chy00glnw269x6qyjin	4	3	3	Estafet Gelas
cmllu1chy00gmnw26mqzn7c8f	5	3	3	Estafet Gelas
cmllu1chy00gnnw260oqb1r3j	6	3	4	Estafet Gelas
cmllu1chy00gonw268jw8jvlb	7	3	2	Estafet Gelas
cmllu1chy00gpnw26p7r6bqri	8	3	2	Estafet Gelas
cmllu1chy00gqnw26jy36iykj	1	3	2	Pair Hunt
cmllu1chy00grnw26thhg9bb7	2	3	3	Pair Hunt
cmllu1chy00gsnw26u4am07rc	3	3	3	Pair Hunt
cmllu1chy00gtnw26bn9rnbtz	4	3	3	Pair Hunt
cmllu1chy00gunw26oorc6fng	5	3	3	Pair Hunt
cmllu1chy00gvnw26il974nxu	6	3	4	Pair Hunt
cmllu1chy00gwnw26z5b1tm0j	7	3	2	Pair Hunt
cmllu1chy00gxnw26ygpuf378	8	3	2	Pair Hunt
cmllu1chy00gynw26pmahg4av	1	3	2	Cup And Rubby
cmllu1chy00gznw2645mxn8a2	2	3	3	Cup And Rubby
cmllu1chy00h0nw26376lkh23	3	3	3	Cup And Rubby
cmllu1chy00h1nw26iiv37wwj	4	3	3	Cup And Rubby
cmllu1chy00h2nw26q1nonoxj	5	3	3	Cup And Rubby
cmllu1chy00h3nw26gzqh6ysw	6	3	4	Cup And Rubby
cmllu1chy00h4nw26hziecfok	7	3	2	Cup And Rubby
cmllu1chy00h5nw265rp2fvzh	8	3	2	Cup And Rubby
cmllu1chy00h6nw26pkjcn94d	1	3	2	Maze Marker
cmllu1chy00h7nw26fgptdf5u	2	3	3	Maze Marker
cmllu1chy00h8nw26p0ridpyd	3	3	3	Maze Marker
cmllu1chy00h9nw26wezwojuh	4	3	3	Maze Marker
cmllu1chy00hanw264hpten9w	5	3	3	Maze Marker
cmllu1chy00hbnw26x6iyn9nq	6	3	4	Maze Marker
cmllu1chy00hcnw268xtemfpg	7	3	2	Maze Marker
cmllu1chy00hdnw26lmu3xyzq	8	3	2	Maze Marker
cmllu1chy00henw26klmvo1a9	1	3	2	Two Facts One Lies
cmllu1chy00hfnw26yvhl5b9f	2	3	3	Two Facts One Lies
cmllu1chy00hgnw26a814bemy	3	3	3	Two Facts One Lies
cmllu1chy00hhnw26cwcqohzc	4	3	3	Two Facts One Lies
cmllu1chy00hinw26ogpxc574	5	3	3	Two Facts One Lies
cmllu1chy00hjnw2619gpxd2o	6	3	4	Two Facts One Lies
cmllu1chy00hknw26mp6iyorp	7	3	2	Two Facts One Lies
cmllu1chy00hlnw268n6y7avc	8	3	2	Two Facts One Lies
cmllu1chy00hmnw2646d5i7p0	1	3	2	Glass Race
cmllu1chy00hnnw26qlvhjsxd	2	3	3	Glass Race
cmllu1chy00honw26jep3nqeh	3	3	3	Glass Race
cmllu1chy00hpnw26eotbxw6f	4	3	3	Glass Race
cmllu1chy00hqnw26axkazdrk	5	3	3	Glass Race
cmllu1chy00hrnw26k22b68id	6	3	4	Glass Race
cmllu1chy00hsnw268vncx9dj	7	3	2	Glass Race
cmllu1chy00htnw262theseqq	8	3	2	Glass Race
cmllu1chy00hunw26mwkn6s7i	1	4	3	Chopstick Master
cmllu1chz00hvnw260qtb5z45	2	4	4	Chopstick Master
cmllu1chz00hwnw26gr7ylrij	3	4	2	Chopstick Master
cmllu1chz00hxnw26y4vn1i72	4	4	3	Chopstick Master
cmllu1chz00hynw265nlljerh	5	4	4	Chopstick Master
cmllu1chz00hznw2671xukddi	6	4	2	Chopstick Master
cmllu1chz00i0nw26cmagu7hi	7	4	2	Chopstick Master
cmllu1chz00i1nw26d7vubnn5	8	4	3	Chopstick Master
cmllu1chz00i2nw26lb1r1lf3	1	4	3	Tic Tac Toe
cmllu1chz00i3nw26vnwdh98i	2	4	4	Tic Tac Toe
cmllu1chz00i4nw26biqwhfja	3	4	2	Tic Tac Toe
cmllu1chz00i5nw26qel7h46h	4	4	3	Tic Tac Toe
cmllu1chz00i6nw26y1mwe6kh	5	4	4	Tic Tac Toe
cmllu1chz00i7nw26t6tibjgh	6	4	2	Tic Tac Toe
cmllu1chz00i8nw26uclvmmnq	7	4	2	Tic Tac Toe
cmllu1chz00i9nw264mnyqgfr	8	4	3	Tic Tac Toe
cmllu1chz00ianw26pujx5rdu	1	4	3	What the Hey
cmllu1chz00ibnw26mexkyh0k	2	4	4	What the Hey
cmllu1chz00icnw26ttz3oo34	3	4	2	What the Hey
cmllu1chz00idnw26p241koou	4	4	3	What the Hey
cmllu1chz00ienw26378smlbv	5	4	4	What the Hey
cmllu1chz00ifnw268s8cofrl	6	4	2	What the Hey
cmllu1chz00ignw26meejlhlb	7	4	2	What the Hey
cmllu1chz00ihnw26567pyqfc	8	4	3	What the Hey
cmllu1chz00iinw26c608y1y3	1	4	3	Wrong Color
cmllu1chz00ijnw26ofq8fw7x	2	4	4	Wrong Color
cmllu1chz00iknw2610emtzw8	3	4	2	Wrong Color
cmllu1chz00ilnw26pgc6do0m	4	4	3	Wrong Color
cmllu1chz00imnw260yq5990z	5	4	4	Wrong Color
cmllu1chz00innw26e2mh3tu6	6	4	2	Wrong Color
cmllu1chz00ionw26rljmj915	7	4	2	Wrong Color
cmllu1chz00ipnw26cj776ogj	8	4	3	Wrong Color
cmllu1chz00iqnw26adbqd7zx	1	4	3	Scoop Them All
cmllu1chz00irnw2681o1fkal	2	4	4	Scoop Them All
cmllu1chz00isnw26vm3ue13i	3	4	2	Scoop Them All
cmllu1chz00itnw26rgxfw2b6	4	4	3	Scoop Them All
cmllu1chz00iunw26xwiztog5	5	4	4	Scoop Them All
cmllu1chz00ivnw26om6aplnf	6	4	2	Scoop Them All
cmllu1chz00iwnw26hm9dwmkl	7	4	2	Scoop Them All
cmllu1chz00ixnw26ta4964kn	8	4	3	Scoop Them All
cmllu1chz00iynw26442sqbge	1	4	3	Walk The Landmine
cmllu1chz00iznw26k948ccqg	2	4	4	Walk The Landmine
cmllu1chz00j0nw2637p8w25h	3	4	2	Walk The Landmine
cmllu1chz00j1nw26bw7hfmsx	4	4	3	Walk The Landmine
cmllu1chz00j2nw264ygpnm91	5	4	4	Walk The Landmine
cmllu1chz00j3nw2662y3nip2	6	4	2	Walk The Landmine
cmllu1chz00j4nw26nbf3bcts	7	4	2	Walk The Landmine
cmllu1chz00j5nw26bhrng0m6	8	4	3	Walk The Landmine
cmllu1chz00j6nw26mtoz2pdi	1	4	3	Granny Pants
cmllu1chz00j7nw26q6x4b0kx	2	4	4	Granny Pants
cmllu1chz00j8nw26k4o5visd	3	4	2	Granny Pants
cmllu1chz00j9nw26fi7vxhwp	4	4	3	Granny Pants
cmllu1chz00janw264ctk9aoh	5	4	4	Granny Pants
cmllu1chz00jbnw268yaqc03c	6	4	2	Granny Pants
cmllu1chz00jcnw26od1t4vku	7	4	2	Granny Pants
cmllu1chz00jdnw26ylc98v16	8	4	3	Granny Pants
cmllu1chz00jenw2600vzel6m	1	4	3	Boom-Pop
cmllu1chz00jfnw26mjy0h9bb	2	4	4	Boom-Pop
cmllu1chz00jgnw26rlkywcog	3	4	2	Boom-Pop
cmllu1chz00jhnw26iaz1lr5z	4	4	3	Boom-Pop
cmllu1chz00jinw26t79es809	5	4	4	Boom-Pop
cmllu1chz00jjnw26t1mn3avs	6	4	2	Boom-Pop
cmllu1chz00jknw26nahvyp5n	7	4	2	Boom-Pop
cmllu1chz00jlnw26svfeqsjc	8	4	3	Boom-Pop
cmllu1chz00jmnw261aoqwcz9	1	1	0	Exchange Pos
cmllu1chz00jnnw26pezhcffg	2	1	0	Exchange Pos
cmllu1chz00jonw26skuwp4vb	3	1	0	Exchange Pos
cmllu1chz00jpnw26h9f3bri7	4	1	0	Exchange Pos
cmllu1chz00jqnw262kwr2f43	1	2	0	Exchange Pos
cmllu1chz00jrnw26i7nnaacw	2	2	0	Exchange Pos
cmllu1chz00jsnw26lv8fsav9	3	2	0	Exchange Pos
cmllu1chz00jtnw26wrhvbd3p	4	2	0	Exchange Pos
cmllu1chz00junw26sw04xstn	1	3	0	Exchange Pos
cmllu1chz00jvnw26y2q6nhrn	2	3	0	Exchange Pos
cmllu1chz00jwnw26fedqzpxv	3	3	0	Exchange Pos
cmllu1chz00jxnw26lch3dyq5	4	3	0	Exchange Pos
cmllu1chz00jynw265tf93bhl	1	4	0	Exchange Pos
cmllu1chz00jznw26qcuguz6d	2	4	0	Exchange Pos
cmllu1chz00k0nw261ppakzwa	3	4	0	Exchange Pos
cmllu1chz00k1nw26ncyw13kk	4	4	0	Exchange Pos
\.


--
-- Data for Name: RallySmallItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallySmallItem" (id, name, price, show_in_inventory) FROM stdin;
1	Sigil Token	5	t
2	Chrono Token	5	t
3	Fragment Token	5	t
4	Rune Material	5	t
5	Shard Material	5	t
6	Flux Material	5	t
7	Kartu Zona	25	f
\.


--
-- Data for Name: RallyZone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RallyZone" (id, name) FROM stdin;
1	Amerika
2	Asia
3	Eropa
4	Afrika
\.


--
-- Data for Name: RawItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RawItem" (id, name) FROM stdin;
1	Wood
2	Glass
3	Water
4	Coal
5	Metal
\.


--
-- Data for Name: RawPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RawPeriod" (id, "rawId", periode, price) FROM stdin;
cmlltznbd0008nw267l739w3q	1	1	100
cmlltznbd0009nw26qsc5tfc7	1	2	110
cmlltznbd000anw26o7qr37o7	1	3	120
cmlltznbd000bnw26fhadpuos	1	4	130
cmlltznbd000cnw26q0ay8mci	1	5	115
cmlltznbd000dnw26exabjrox	1	6	105
cmlltznbd000enw26etzc9w8v	1	7	120
cmlltznbd000fnw269vg1rhz5	1	8	125
cmlltznbd000gnw26rq835x6a	2	1	500
cmlltznbd000hnw26ttpzjs07	2	2	530
cmlltznbd000inw26jp3kx1u6	2	3	530
cmlltznbd000jnw263fvrn587	2	4	490
cmlltznbd000knw2673083bov	2	5	470
cmlltznbd000lnw26hcix34p0	2	6	520
cmlltznbd000mnw269lwt8qut	2	7	535
cmlltznbd000nnw26o8f57l5y	2	8	505
cmlltznbd000onw263tj810x0	3	1	200
cmlltznbd000pnw268vtmky9e	3	2	215
cmlltznbd000qnw26e8ziave5	3	3	185
cmlltznbd000rnw267mu86cu0	3	4	175
cmlltznbd000snw26jh32lrjx	3	5	215
cmlltznbd000tnw26tp6rdczs	3	6	215
cmlltznbd000unw26t5b1aq0w	3	7	200
cmlltznbd000vnw26rsx0hxfj	3	8	220
cmlltznbd000wnw261x8low9r	4	1	250
cmlltznbd000xnw26ghuhxsdw	4	2	265
cmlltznbd000ynw26q76aake8	4	3	285
cmlltznbd000znw26963kvgmn	4	4	240
cmlltznbd0010nw2693pzjlox	4	5	230
cmlltznbd0011nw26a61eqaxt	4	6	290
cmlltznbd0012nw265adgxm1p	4	7	290
cmlltznbd0013nw26ue1hsytm	4	8	260
cmlltznbd0014nw26gtybcf2p	5	1	350
cmlltznbd0015nw26lviitmf1	5	2	375
cmlltznbd0016nw26o194h0wg	5	3	405
cmlltznbd0017nw26nbstgqui	5	4	415
cmlltznbd0018nw26hv9dtnkp	5	5	380
cmlltznbd0019nw26eik8vigu	5	6	360
cmlltznbd001anw26tatss7up	5	7	395
cmlltznbd001bnw26xeo2mkwq	5	8	350
\.


--
-- Data for Name: RawStockPeriod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RawStockPeriod" (id, "rawId", stock, periode, price) FROM stdin;
cmlltznjs002nnw26y72wfmfh	1	15	1	120
cmlltznjs002pnw26yjfsnpbz	3	14	1	230
cmlltznjs002qnw268c6ykk8c	4	24	1	270
cmlltznjs002rnw2656y0gky1	5	15	1	375
cmlltznjs002tnw26f6g4kytf	2	15	2	490
cmlltznjs002unw26x0ja0s57	3	23	2	190
cmlltznjs002vnw26k7o6oo32	4	20	2	220
cmlltznjs002ynw26jeliwiah	2	21	3	620
cmlltznjs0030nw265pnxs11v	4	12	3	375
cmlltznjs0032nw26hp0tahf2	1	25	4	220
cmlltznjs0033nw26e2axsmux	2	13	4	575
cmlltznjs0034nw267urkps9z	3	13	4	250
cmlltznjs0035nw26umlcbfjn	4	14	4	400
cmlltznjs0036nw262y5tp8st	5	17	4	600
cmlltznjs0037nw26ngml6s9v	1	22	5	50
cmlltznjs0038nw26xwljymm3	2	10	5	350
cmlltznjs0039nw26686ing5r	3	25	5	120
cmlltznjs003anw26u0j6dbse	4	23	5	150
cmlltznjs003bnw26dvb4o6fa	5	12	5	280
cmlltznjs003mnw26ajx69g4x	1	10	8	300
cmlltznjs003nnw26mirb4f17	2	10	8	1000
cmlltznjs003onw26eomgcjpd	3	10	8	450
cmlltznjs003pnw260o6b0e4h	4	10	8	550
cmlltznjs003qnw26knb7cgok	5	10	8	700
cmlltznjs002onw26vjy31m3b	2	11	1	550
cmlltznjs002snw261z9qsq14	1	0	2	95
cmlltznjs002wnw264somv6ux	5	11	2	325
cmlltznjs002xnw26o1her93s	1	0	3	180
cmlltznjs002znw26n7xz91ct	3	19	3	270
cmlltznjs0031nw261xl9da95	5	6	3	500
cmlltznjs003cnw26axq2v9ly	1	0	6	105
cmlltznjs003dnw268qkmeu7z	2	12	6	520
cmlltznjs003fnw26h27k5wg0	4	9	6	290
cmlltznjs003gnw26c7twobza	5	14	6	360
cmlltznjs003enw261ivca6hn	3	11	6	215
cmlltznjs003jnw26lmzqivw2	3	0	7	150
cmlltznjs003hnw26v0i2y6je	1	0	7	100
cmlltznjs003knw26va3svplv	4	9	7	250
cmlltznjs003inw26v86d3z5v	2	0	7	500
cmlltznjs003lnw26bhgbt5dp	5	9	7	350
\.


--
-- Data for Name: RawUserAmount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."RawUserAmount" (id, "tradingDataId", "rawItemId", amount) FROM stdin;
cmllwup0n00b5qv01i89y3z04	cmlltzwho006bnw2675cqbryr	1	0
cmllwp5ek007fqv016x6gtn8h	cmllu00kw006xnw261mwscl7e	1	0
cmllwkt6r003hqv015rfjyd5w	cmllu09jj007xnw26irsp7nwv	1	0
cmllwjqt00025qv01gn077eab	cmllu0gh8008dnw26sfpjylw0	1	0
cmllwo9p0006jqv01k7mqigo9	cmlltzyhy006lnw26tbnvyy6x	3	0
cmllwwt9400cbqv014nu08u47	cmllu004r006vnw263zlbwtzm	1	0
cmllwj928001fqv017yp854m8	cmlltzxsz006hnw267qcl5gqp	1	0
cmllwj94s001hqv01lzm0udxs	cmlltzxsz006hnw267qcl5gqp	3	0
cmllx12vj00flqv014ypntk0b	cmllu0bdv0081nw26gpystvor	1	0
cmllwsopu009hqv016dt48bhk	cmllu08dp007rnw26v4dgmp23	1	0
cmlm25bt601y5qo01cxylde6z	cmllu08dp007rnw26v4dgmp23	3	0
cmllwmkvy005lqv01csoio7it	cmllu0hmt008hnw26efktlnfg	3	0
cmllwip04000zqv01muw2ilf5	cmllu00w3006znw26zc4y9ek0	1	0
cmllwjqyk0027qv01a66m6623	cmllu0gh8008dnw26sfpjylw0	2	0
cmllwn716005zqv01sazm1152	cmllu082g007pnw26i9kqife7	1	0
cmllwm0mz004xqv01a2gok7nl	cmllu0kvl008tnw26fe8h34vp	1	0
cmllwllgw003vqv01uwhjxkpj	cmlltzz1o006pnw26ztynyxv4	1	0
cmllwxttv00d1qv01ndx1eo7u	cmllu0ofe0099nw26n7luunss	1	0
cmllwlqve004nqv01u9r0uthh	cmllu0i3k008jnw26vfsdew9m	1	0
cmllww2xp00bzqv01x394awc6	cmllu0j14008nnw269ihx0pxl	1	0
cmllwszwn00a1qv01m2mack4r	cmllu07os007nnw2657lw1mt3	1	0
cmllx00jk00ejqv01qys5o2ne	cmllu04r7007bnw26zxtj1wy7	1	0
cmllwmdkb0059qv01r43ed79e	cmllu0mw10093nw26ppcub6u6	1	0
cmllwmlkv005nqv01oo5b4x1y	cmllu0hmt008hnw26efktlnfg	4	0
cmllwip2s0011qv01kj8ycjxk	cmllu00w3006znw26zc4y9ek0	3	0
cmllwp5h7007hqv01jznsunnb	cmllu00kw006xnw261mwscl7e	3	0
cmllwk02f002fqv01a34p11qf	cmllu095j007vnw26ikcqk5fx	3	0
cmllwkfsz002vqv011je5ktnt	cmllu0dry0085nw26fee82749	3	0
cmllwkff4002rqv0154zx5xde	cmllu0dry0085nw26fee82749	1	0
cmllwp0p90077qv01nq3cpt2n	cmllu01fk0071nw26rgvf2gft	5	0
cmllws111008zqv01dd70yibk	cmllu0fek0089nw26lw6emt67	3	0
cmllwtowq00ahqv01zhfmg8xh	cmllu00w3006znw26zc4y9ek0	4	0
cmllz7rr500ctqo017j4v0vvt	cmllu0bxd0083nw26cle9wtdh	1	0
cmllwoarq006nqv0100dp413h	cmlltzyhy006lnw26tbnvyy6x	5	0
cmllx0rx900fdqv01gwpdyfl1	cmllu0ik5008lnw26o95uvsly	2	0
cmllws36u0097qv01exgafl3g	cmlltzzt8006tnw26kuftz5q9	1	0
cmllwp0mc0075qv01xr3xdprl	cmllu01fk0071nw26rgvf2gft	4	0
cmllwi995000jqv011tlgs1v6	cmlltzw6n0069nw266t9ghu5c	1	0
cmllwj6wq0017qv0128k545gh	cmllu06wy007jnw26xy0x6dn5	1	0
cmllz84bz00d5qo0162duu202	cmllu0bxd0083nw26cle9wtdh	3	0
cmllwo92p006hqv019ad8ta1u	cmlltzyhy006lnw26tbnvyy6x	1	0
cmllx00jn00elqv01m9c6ww1c	cmllu04r7007bnw26zxtj1wy7	3	0
cmllx05xo00etqv018ujrvdd2	cmllu03le0077nw267n1s0mb6	5	0
cmllwwiqm00c5qv01tfmcxfvo	cmllu0h0u008fnw2603crdwbl	1	0
cmllwp0m90073qv01cju0tztr	cmllu01fk0071nw26rgvf2gft	1	0
cmllwn71b0061qv010tdwch6a	cmllu082g007pnw26i9kqife7	3	0
cmllwsvcw009tqv01qkh5jjr4	cmllu0mw10093nw26ppcub6u6	3	0
cmllwmdv9005bqv01ps7x4rwe	cmllu0mw10093nw26ppcub6u6	4	0
cmllwlluq0043qv01xcwsobtu	cmllu02a60073nw26f5vv4wcw	1	0
cmllwi99a000lqv0132ma7eqs	cmlltzw6n0069nw266t9ghu5c	3	0
cmllws0so008xqv01wgjdyxq4	cmllu0fek0089nw26lw6emt67	1	0
cmllwmjvw005jqv01dvfqu1wy	cmllu0hmt008hnw26efktlnfg	1	0
cmllwtk4b00abqv01t722oh9n	cmlltzw6n0069nw266t9ghu5c	5	0
cmllwx4u000chqv01qc9aytls	cmllu05ad007dnw26h2vqc9kh	4	0
cmllwifi4000tqv01fa9nm51l	cmlltzyqo006nnw26bdi47ek8	5	0
cmllwllh1003xqv0156hjdd09	cmlltzz1o006pnw26ztynyxv4	2	0
cmllwkfvp002xqv013b1p1eih	cmllu0dry0085nw26fee82749	4	0
cmllx05xj00erqv018xkssyc2	cmllu03le0077nw267n1s0mb6	2	0
cmllwiffm000rqv01v91tn6xf	cmlltzyqo006nnw26bdi47ek8	1	0
cmllwodmh006tqv01g9poxfvr	cmlltzy4f006jnw264h8kyavc	1	0
cmllwrcst008dqv01vi2ynmjb	cmllu03le0077nw267n1s0mb6	1	0
cmllwtk1z00a9qv01ll4anlfl	cmlltzw6n0069nw266t9ghu5c	4	0
cmllwj7210019qv01jmd3b85s	cmllu06wy007jnw26xy0x6dn5	4	0
cmllwlqvk004pqv01j7zvxbhj	cmllu0i3k008jnw26vfsdew9m	2	0
cmllwjr1f0029qv012a8a693l	cmllu0gh8008dnw26sfpjylw0	5	0
cmllwpw12007pqv01gdvg3pyt	cmllu05ad007dnw26h2vqc9kh	1	0
cmllws1c40091qv01yvnfe4xn	cmllu0fek0089nw26lw6emt67	4	0
cmllwk0dj002hqv01cdzvsmty	cmllu095j007vnw26ikcqk5fx	4	0
cmllwpw3p007tqv01gy1yfw5g	cmllu05ad007dnw26h2vqc9kh	5	0
cmllwpw3l007rqv01mds534zn	cmllu05ad007dnw26h2vqc9kh	2	0
cmllwz49x00dxqv014p2g0ngh	cmlltzy4f006jnw264h8kyavc	2	0
cmllwxtwi00d3qv0125b9fhwp	cmllu0ofe0099nw26n7luunss	4	0
cmllwkt8f003jqv01btyok1uh	cmllu09jj007xnw26irsp7nwv	2	0
cmllwjbj8001nqv011a9we5fe	cmllu07dj007lnw261urdgi6e	1	30
cmllwsufa009nqv019w4fabkm	cmllu07dj007lnw261urdgi6e	3	0
cmllwvc0h00brqv01qwilkffj	cmllu02a60073nw26f5vv4wcw	5	0
cmllx0qub00f7qv010ce08nu4	cmllu02z70075nw267utb00t1	3	0
cmllwuhzx00arqv019q0ly6rr	cmlltzvq60067nw26qemjfwxj	1	0
cmllwlluu0045qv0141ltkuls	cmllu02a60073nw26f5vv4wcw	2	0
cmllwlqy7004rqv017wi5nqwn	cmllu0i3k008jnw26vfsdew9m	5	0
cmllzopsb00nzqo01jjx5p6br	cmllu0l6u008vnw26jnnl3z1k	3	0
cmllzocqu00nnqo013lpwmfsk	cmllu02a60073nw26f5vv4wcw	3	0
cmllzkohk00jnqo01nrqgj6ps	cmllu07os007nnw2657lw1mt3	3	0
cmllx2g6j00gbqv01g46cg1nz	cmllu08or007tnw26wd6mv6wd	3	0
cmllz7mw800cnqo01oxrv343d	cmllu09jj007xnw26irsp7nwv	5	0
cmllx6yx400ipqv01vnxf0h93	cmlltzw6n0069nw266t9ghu5c	2	0
cmllxdihm00k3qv01jcx53z08	cmllu05wr007fnw263pcca89z	2	0
cmllznj1d00mzqo01hpn1nwzc	cmllu0h0u008fnw2603crdwbl	3	0
cmllx12vo00fnqv017w9ocr93	cmllu0bdv0081nw26gpystvor	5	0
cmllyvis4006dqo01w1as99u8	cmllu095j007vnw26ikcqk5fx	1	0
cmllz4ge100avqo01x3pk0h35	cmlltzwvk006dnw261evs8qz0	3	0
cmllyqa9y003jqo01bw7l544w	cmllu06wy007jnw26xy0x6dn5	5	0
cmllx2xxe00glqv016pqyc911	cmllu06wy007jnw26xy0x6dn5	2	0
cmllxdihi00k1qv01qmyzjumt	cmllu05wr007fnw263pcca89z	1	0
cmlm0civ900zpqo01wnu819gz	cmlltzwho006bnw2675cqbryr	3	0
cmllz75gd00c5qo01gseojcb5	cmllu0ik5008lnw26o95uvsly	1	0
cmllxnxn60003qo01ze5j54xk	cmllu02z70075nw267utb00t1	1	0
cmllz10xh0089qo017hgu7eph	cmllu082g007pnw26i9kqife7	5	0
cmllwnqeg0069qv0177ehfgjl	cmllu0l6u008vnw26jnnl3z1k	1	0
cmllyreuy0047qo01oeq6xe95	cmllu0bdv0081nw26gpystvor	3	0
cmllzq60u00p3qo01lt7rnm5w	cmllu06j7007hnw26uw0sp36v	3	0
cmllxv1i7002dqo0150c8s735	cmlltzy4f006jnw264h8kyavc	5	0
cmllx3d2500gvqv0147zqjjrn	cmllu0jsw008pnw26umu3i0fj	4	0
cmllx3d1y00grqv01jz6qh70d	cmllu0jsw008pnw26umu3i0fj	1	0
cmllz4ge100axqo016b8z8m42	cmlltzwvk006dnw261evs8qz0	5	0
cmllx2g0y00g9qv014qcbuw8p	cmllu08or007tnw26wd6mv6wd	1	0
cmllzms3z00mbqo01y8hrqud0	cmlltzy4f006jnw264h8kyavc	4	0
cmllz18ey008hqo01mk9fsggh	cmlltzwho006bnw2675cqbryr	5	0
cmllwoa2s006lqv01tgxu6n0d	cmlltzyhy006lnw26tbnvyy6x	4	0
cmllwx95e00cnqv01a1ut1uhr	cmlltzyqo006nnw26bdi47ek8	2	0
cmllzdv9w00fhqo01j01gpjky	cmllu0ep90087nw26uyzbvykl	4	0
cmlm0auxi00z7qo01p87oya7x	cmllu004r006vnw263zlbwtzm	5	0
cmllz76mb00cdqo01w8m7boc8	cmllu0j14008nnw269ihx0pxl	5	0
cmllyxzwf007fqo01rfflntj6	cmllu04r7007bnw26zxtj1wy7	5	0
cmllzmxif00mhqo017xyd0d8b	cmlltzz1o006pnw26ztynyxv4	5	0
cmllwkg1d002zqv01rxpmxtrz	cmllu0dry0085nw26fee82749	5	0
cmllz21t6009hqo011z2ebu26	cmlltzvq60067nw26qemjfwxj	5	0
cmllzt3t900rhqo01cr19arcn	cmlltzzt8006tnw26kuftz5q9	3	0
cmllx1dof00ftqv01al0cxrs0	cmllu044s0079nw26frbt1r2i	1	0
cmllx3d2200gtqv01fvt08l1s	cmllu0jsw008pnw26umu3i0fj	3	0
cmllx6jk900i9qv01z027rj25	cmllu0ep90087nw26uyzbvykl	2	0
cmllxpte0000lqo01b0tjivfz	cmllu0mw10093nw26ppcub6u6	5	0
cmlm0guiw010vqo01x1qp3ntk	cmllu082g007pnw26i9kqife7	4	0
cmllzzxhq00u1qo01iiusq4l3	cmllu08dp007rnw26v4dgmp23	5	0
cmllzk41l00ipqo01ej2mfffc	cmllu004r006vnw263zlbwtzm	3	0
cmllwkfna002tqv0180u278uh	cmllu0dry0085nw26fee82749	2	0
cmllzm2st00lhqo01h06mzig7	cmllu03le0077nw267n1s0mb6	4	0
cmlm05gew00whqo010wejesqs	cmllu0bxd0083nw26cle9wtdh	2	0
cmllz21kt009fqo01n5zv2qv6	cmlltzvq60067nw26qemjfwxj	3	0
cmllzops800nxqo01vai53hii	cmllu0l6u008vnw26jnnl3z1k	2	0
cmlm08wv700yfqo017rshuj7i	cmllu08or007tnw26wd6mv6wd	2	0
cmllxuw9g0027qo01rxw4ayjh	cmllu07os007nnw2657lw1mt3	5	0
cmllztsyp00rzqo01npzvrg8c	cmllu04r7007bnw26zxtj1wy7	4	0
cmllz4awq00apqo01a4rlhmtm	cmllu0jsw008pnw26umu3i0fj	5	0
cmllz5oaf00bdqo0102qnyhh6	cmlltzy4f006jnw264h8kyavc	3	0
cmllx5zyo00i3qv01yi5vxtel	cmllu0l6u008vnw26jnnl3z1k	4	0
cmllxumuc0021qo0133xj3ff4	cmlltzzt8006tnw26kuftz5q9	5	0
cmllzdv7900ffqo01rw8zrz3s	cmllu0ep90087nw26uyzbvykl	3	0
cmllzxnp400tjqo01iey0re08	cmllu0bdv0081nw26gpystvor	4	0
cmllzss2w00rbqo012pdlhr39	cmllu0j14008nnw269ihx0pxl	3	0
cmllzgjvq00gfqo01qkylu0mt	cmlltzyhy006lnw26tbnvyy6x	2	0
cmllzmeg500lzqo01gcra4uxk	cmllu0i3k008jnw26vfsdew9m	3	0
cmllzhmgl00hjqo01bk1xgd9e	cmlltzzt8006tnw26kuftz5q9	4	0
cmllz1kzp008zqo01w8molqmf	cmllu05wr007fnw263pcca89z	3	0
cmlm08wvd00yhqo01laaxb0cj	cmllu08or007tnw26wd6mv6wd	4	0
cmllwum8k00axqv01at3ukfg8	cmlltzzi0006rnw2673ipn4ol	1	15
cmlm04qbr00w7qo01lkfi7a8g	cmlltzwvk006dnw261evs8qz0	4	0
cmllx1eoo00fvqv01dip43jfc	cmllu044s0079nw26frbt1r2i	3	0
cmllxwwpl0037qo01dnt5njey	cmllu0h0u008fnw2603crdwbl	4	0
cmllzq60x00p5qo015h5pe4a8	cmllu06j7007hnw26uw0sp36v	4	0
cmllzvhuh00sjqo019mf293ss	cmllu095j007vnw26ikcqk5fx	2	0
cmllxcry000jtqv01bvchbbh4	cmllu02z70075nw267utb00t1	4	0
cmlm03r7x00vjqo0184exh131	cmllu0i3k008jnw26vfsdew9m	4	0
cmllzj43500i5qo01d4l6lnpu	cmllu044s0079nw26frbt1r2i	4	0
cmlm06bo700wtqo01tdgpsxjb	cmlltzxsz006hnw267qcl5gqp	2	0
cmlm06bqm00wvqo018s404xm4	cmlltzxsz006hnw267qcl5gqp	4	0
cmllz75ww00c7qo01tv9o37yy	cmllu0ik5008lnw26o95uvsly	5	0
cmlm0mjl00155qo01g4a2dc8x	cmllu0ofe0099nw26n7luunss	3	0
cmlm1xffl01unqo018lqk14v9	cmllu07os007nnw2657lw1mt3	4	0
cmlm0ilsv0137qo01ksqknd7x	cmllu01fk0071nw26rgvf2gft	2	0
cmllz8h7o00dbqo0122xdsjrh	cmllu0bxd0083nw26cle9wtdh	4	0
cmlm10ih301b1qo01ou25v1kr	cmllu0ik5008lnw26o95uvsly	3	0
cmlm0gw2i0111qo018toac2ez	cmlltzzi0006rnw2673ipn4ol	2	1
cmlm0gw4u0113qo0197vyyqnp	cmlltzzi0006rnw2673ipn4ol	3	0
cmllxamh400jhqv018l6m461i	cmlltzzi0006rnw2673ipn4ol	4	4
cmllwum8n00azqv01m5598akz	cmlltzzi0006rnw2673ipn4ol	5	0
cmlm0gxzo0119qo01yk1g3w2r	cmlltzvq60067nw26qemjfwxj	4	0
cmllz8tsg00dpqo01hn8aofcb	cmllu0bxd0083nw26cle9wtdh	5	0
cmlm11cew01bpqo0142rmcvu3	cmllu095j007vnw26ikcqk5fx	5	0
cmlm19skw01h7qo011ifg9vn2	cmlltzwho006bnw2675cqbryr	2	0
cmlm1cehl01itqo01midb6rtg	cmllu0ofe0099nw26n7luunss	5	0
cmlm18tmk01g7qo01qqfy6qo0	cmllu0ep90087nw26uyzbvykl	1	0
cmlm0xvbp019xqo01zzdp45x1	cmlltzwvk006dnw261evs8qz0	1	0
cmlm19m6n01gzqo019fnbrzy7	cmllu08or007tnw26wd6mv6wd	5	0
cmlm1752401ezqo01q62u3l39	cmlltzzt8006tnw26kuftz5q9	2	0
cmlm1410q01dnqo019k1sghlu	cmllu00kw006xnw261mwscl7e	2	0
cmlm1esg501jrqo014ur4alci	cmllu0h0u008fnw2603crdwbl	5	0
cmlm1afqf01hnqo01b6mdg9r9	cmllu06j7007hnw26uw0sp36v	5	0
cmlm1afqc01hlqo01gn5zfa5g	cmllu06j7007hnw26uw0sp36v	2	0
cmlm0vx1n0199qo0110uo5rpu	cmllu06j7007hnw26uw0sp36v	1	0
cmlm1dvf301jhqo01w49b182i	cmlltzxsz006hnw267qcl5gqp	5	0
cmlm0kui8014lqo017z2og046	cmllu03le0077nw267n1s0mb6	3	0
cmlm1951t01gfqo014mgjah9g	cmllu0bdv0081nw26gpystvor	2	0
cmlm235ov01xpqo01zq4ivomb	cmllu0fek0089nw26lw6emt67	2	0
\.


--
-- Data for Name: TradingData; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TradingData" (id, "userId", idr, usd, eternites, map, point, "isPlayedThunt", "itemFromThunt", "hadPitching", "finalIDR") FROM stdin;
cmllu05wr007fnw263pcca89z	cmllu05wr007enw26qhxoziaf	-41850000000	0	0	0	0	t	0	t	-41850000000
cmllu00kw006xnw261mwscl7e	cmllu00kw006wnw26qae8g3az	-58130000000	0	0	0	0	t	0	t	-58130000000
cmllu0ik5008lnw26o95uvsly	cmllu0ihs008knw26uxndqk65	-79360000000	0	0	0	0	t	0	t	-79360000000
cmllu0nfk0095nw26ouo5e5wf	cmllu0nfh0094nw263ap9l1qc	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu01fk0071nw26rgvf2gft	cmllu01fk0070nw265m72m1r3	-4825000000	0	0	0	0	t	0	t	-4825000000
cmlltzw6n0069nw266t9ghu5c	cmlltzw6n0068nw26ok4du3dg	-89370000000	0	0	0	0	t	0	f	-89370000000
cmllu0q4r009jnw2681t5983l	cmllu0q4r009inw265lzkmcks	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu044s0079nw26frbt1r2i	cmllu044s0078nw2655z3t63q	-88390000000	0	0	0	0	t	0	f	-88390000000
cmlltzz1o006pnw26ztynyxv4	cmlltzz1o006onw26z5nw3ym5	-65370000000	0	0	0	0	t	0	t	-65370000000
cmllu196l00brnw2667gnkvbp	cmllu196l00bqnw26xrrsjyue	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0j14008nnw269ihx0pxl	cmllu0j13008mnw26lqw4m9f8	-43365000000	0	0	0	0	t	0	t	-43365000000
cmllu0xuc00ajnw26deatpibn	cmllu0xuc00ainw26mcjjtj51	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu02z70075nw267utb00t1	cmllu02z70074nw26j1trbg2g	-64649000000	0	0	0	0	f	0	t	-64649000000
cmlltzyqo006nnw26bdi47ek8	cmlltzyqo006mnw26bgtbrnmc	-59605000000	0	0	0	0	t	0	t	-59605000000
cmllu00w3006znw26zc4y9ek0	cmllu00w3006ynw26cfg87gfh	-60765000000	0	0	0	0	f	0	t	-60765000000
cmllu04r7007bnw26zxtj1wy7	cmllu04r7007anw2658mcrz6q	-91075000000	0	0	0	0	t	0	f	-91075000000
cmllu0pft009fnw26ohjy69wx	cmllu0pft009enw2673nrx5up	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0dry0085nw26fee82749	cmllu0dry0084nw269ouzezpe	-5620800000	0	0	0	0	t	0	t	-5620800000
cmllu0h0u008fnw2603crdwbl	cmllu0h0u008enw26n48e0w6j	-7418100000	0	0	0	0	t	0	t	-7418100000
cmllu0sqs009znw266nq1xg1h	cmllu0sqs009ynw26x7k7zy1t	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzvq60067nw26qemjfwxj	cmlltzvq60066nw26zepilfjz	-55150000000	0	0	0	0	t	0	t	-55150000000
cmlltzzt8006tnw26kuftz5q9	cmlltzzt8006snw26nr1ohyh2	-31452800000	0	0	0	0	f	0	t	-31452800000
cmllu07os007nnw2657lw1mt3	cmllu07os007mnw26m4mfommf	-52630000000	0	0	0	0	t	0	t	-52630000000
cmllu08or007tnw26wd6mv6wd	cmllu08or007snw26xe94e7ly	-68475000000	0	0	0	0	t	0	t	-68475000000
cmlltzwho006bnw2675cqbryr	cmlltzwho006anw267zl21k8v	-61855000000	0	0	0	0	t	0	t	-61855000000
cmllu0p4d009dnw26tsacepay	cmllu0p4d009cnw267n81fa5i	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu004r006vnw263zlbwtzm	cmllu004r006unw26vyr5kc86	-42712400000	0	0	0	0	f	0	t	-42712400000
cmllu0bdv0081nw26gpystvor	cmllu0bdv0080nw26zfj0le9u	-55925000000	0	0	0	0	t	0	t	-55925000000
cmllu0fxy008bnw26pmzdyp7x	cmllu0fxy008anw26vmmmf5py	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzy4f006jnw264h8kyavc	cmlltzy4f006inw26xxw81zxu	-44730000000	0	0	0	0	t	0	t	-44730000000
cmlltzwvk006dnw261evs8qz0	cmlltzwvk006cnw26z65htu3l	-39752000000	0	0	0	0	t	0	t	-39752000000
cmllu0ofe0099nw26n7luunss	cmllu0ofe0098nw26e7xaoeze	-68635000000	0	0	0	0	t	0	t	-68635000000
cmllu0vav00a9nw26x0v6qk2d	cmllu0vav00a8nw26lbckuoaw	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0mw10093nw26ppcub6u6	cmllu0mw00092nw26iladjbb1	-38705000000	0	0	0	0	f	0	t	-38705000000
cmllu138l00b9nw26niv28ycf	cmllu138l00b8nw26rmi1vp51	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0fek0089nw26lw6emt67	cmllu0fek0088nw266ta8w83u	-37250000000	0	0	0	0	t	0	t	-37250000000
cmllu0ep90087nw26uyzbvykl	cmllu0ep90086nw267o9q98jc	-27760200000	0	0	0	0	t	0	t	-27760200000
cmllu0aow007znw26ph3xy4vp	cmllu0aow007ynw265hnqz0iq	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0vws00abnw26x54snjsj	cmllu0vwr00aanw26yff03n33	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0bxd0083nw26cle9wtdh	cmllu0bxd0082nw26rnea0tz5	-73432000000	0	0	0	0	f	0	f	-73432000000
cmlltzyhy006lnw26tbnvyy6x	cmlltzyhy006knw26ttb1zmjq	-7763100000	0	0	0	0	t	0	t	-7763100000
cmllu02a60073nw26f5vv4wcw	cmllu02a60072nw26b19l6cpv	-87805000000	0	0	0	0	t	0	f	-87805000000
cmllu082g007pnw26i9kqife7	cmllu082g007onw26ngrgblmg	-62110000000	0	0	0	0	t	0	t	-62110000000
cmllu0i3k008jnw26vfsdew9m	cmllu0i3j008inw26p9xbk1q1	-53010000000	0	0	0	0	t	0	t	-53010000000
cmllu05ad007dnw26h2vqc9kh	cmllu05ad007cnw26zuyfiso4	-48505000000	0	0	0	0	t	0	t	-48505000000
cmllu0z8f00apnw26w09hjbzj	cmllu0z8f00aonw26kgqvcibb	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0oqj009bnw26ef029m3t	cmllu0oqj009anw26f779vzy0	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu095j007vnw26ikcqk5fx	cmllu095j007unw26hvsqh6fh	-78970000000	0	0	0	0	t	0	t	-78970000000
cmlltzveu0065nw26flt0u3w2	cmlltzveu0064nw26bkctbuot	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0hmt008hnw26efktlnfg	cmllu0hmt008gnw26908yrmiz	-56005000000	0	0	0	0	t	0	t	-56005000000
cmllu0mci0091nw26pkpnhako	cmllu0mci0090nw26ehbbq9nv	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0pqu009hnw26fws9bgmx	cmllu0pqu009gnw26wwonajk5	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu108800avnw26oqox2pw0	cmllu108800aunw26fyalyad4	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu10jd00axnw26enlyisk3	cmllu10jd00awnw26cpp0m5gg	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu08dp007rnw26v4dgmp23	cmllu08dp007qnw26azxec0z3	-57915000000	0	0	0	0	t	0	t	-57915000000
cmllu0r1u009pnw26suv9sv6f	cmllu0r1u009onw268jm2o436	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzzi0006rnw2673ipn4ol	cmlltzzi0006qnw26o7eoh06k	56240000000	0	0	0	0	f	0	t	56240000000
cmllu03le0077nw267n1s0mb6	cmllu03le0076nw26u43fd9e8	-40879800000	0	0	0	0	t	0	t	-40879800000
cmllu11p800b1nw26nltm7xtr	cmllu11p800b0nw26e7cmevk0	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0zjl00arnw264vm1w6k3	cmllu0zjl00aqnw26ftj5lgb2	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0uzj00a7nw262p3q80ij	cmllu0uzj00a6nw26l34vsr6i	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu112u00aznw267lj563ni	cmllu112u00aynw26rfge283j	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0key008rnw269zjtjbqd	cmllu0key008qnw26k1yd7dl0	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0jsw008pnw26umu3i0fj	cmllu0jsw008onw26d3yg6n7a	-40440000000	0	0	0	0	t	0	t	-40440000000
cmllu12gw00b5nw26kbed7d0i	cmllu12gw00b4nw26esvmmr22	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu1byq00c1nw2647nqfpex	cmllu1byq00c0nw262y9h83ia	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0rcs009rnw26znkjwn8k	cmllu0rcs009qnw263e9fnfv2	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0wg800adnw26kfkat0y5	cmllu0wg800acnw262m7ttzzw	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0szi00a1nw26orreko3y	cmllu0szi00a0nw263jl3tucr	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu16y900blnw269pvuvw7t	cmllu16y900bknw26qu0bkk62	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0ulj00a5nw268ytxa2uw	cmllu0ulj00a4nw26vnu9zram	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu1a1c00bvnw26ji8102jb	cmllu1a1c00bunw262qt8053m	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu140h00bdnw26mlpdw8jp	cmllu140h00bcnw265h647jqa	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0yuc00annw26ns26vtsg	cmllu0yuc00amnw26uij0ng2h	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu17ve00bnnw26z59138bc	cmllu17ve00bmnw26m89dtpj6	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu1bcd00bznw26n0el8g43	cmllu1bcb00bynw26nm0a0ob0	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu09jj007xnw26irsp7nwv	cmllu09jj007wnw26gt903jbv	-68035000000	0	0	0	0	t	0	t	-68035000000
cmllu0l6u008vnw26jnnl3z1k	cmllu0l6u008unw26j7pjdm96	-48395000000	0	0	0	0	t	0	t	-48395000000
cmllu19kg00btnw261ow4op2v	cmllu19kg00bsnw266w9v19l5	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0td800a3nw262ht31912	cmllu0td800a2nw26o2u0qnp4	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu14jx00bfnw26elfn5d2s	cmllu14jx00benw26anykfz44	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu15po00bjnw26ibn44gef	cmllu15po00binw2662m5a31b	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu12xr00b7nw26wr5o88np	cmllu12xr00b6nw26hz5pl2vo	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu1aq100bxnw26b62ewqhj	cmllu1aq100bwnw26vjgyqzks	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu13jr00bbnw26b29n8vba	cmllu13jq00banw26vpuioxve	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu18px00bpnw26w59yac82	cmllu18px00bonw26qwry5a3m	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu06j7007hnw26uw0sp36v	cmllu06j7007gnw266b846i76	-54855000000	0	0	0	0	t	0	t	-54855000000
cmllu0zup00atnw26ckrxshge	cmllu0zup00asnw263llxk1mp	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0xb100ahnw26ewmpqkz3	cmllu0xb100agnw26h6qmqvug	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0lkq008xnw26y4yit4yq	cmllu0lkq008wnw268oqo0p2k	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0rny009tnw263h60sag2	cmllu0rny009snw2660lasy3h	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu07dj007lnw261urdgi6e	cmllu07dj007knw26ajbfnas1	-69650000000	0	0	0	0	t	0	t	-69650000000
cmllu0lyf008znw26gnby6kvt	cmllu0lyf008ynw26wzrokbnt	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzxcr006fnw26u4bkuwe2	cmlltzxcr006enw2629qg9kso	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0qqu009nnw26ew0dltcy	cmllu0qqu009mnw26mxm58yt0	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0ntb0097nw262v07epzv	cmllu0ntb0096nw26o13lvjde	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu156600bhnw26kvbk54yr	cmllu156600bgnw26v1vz98yp	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0wra00afnw26aw1vn3hu	cmllu0wra00aenw26ufu47wxz	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0yb800alnw268od7dl6c	cmllu0yb800aknw263arqi19j	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzxsz006hnw267qcl5gqp	cmlltzxsz006gnw26bpuhyqcp	-54530000000	0	0	0	0	t	0	t	-54530000000
cmllu125p00b3nw26diksq3t9	cmllu125p00b2nw26q5ruf0n4	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0qfr009lnw2650wcikkv	cmllu0qfr009knw26rmucf43d	-90000000000	0	0	0	0	f	0	f	-90000000000
cmlltzuyd0063nw26grnr03c2	cmlltzuyd0062nw26wzaqu2kd	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0kvl008tnw26fe8h34vp	cmllu0kvl008snw26fnx0ym7n	-35718700000	0	0	0	0	t	0	t	-35718700000
cmllu0rzf009vnw26d5ad9k87	cmllu0rzf009unw263llq5js8	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu06wy007jnw26xy0x6dn5	cmllu06wy007inw264dm5fgfh	-99702300000	0	0	0	0	t	0	t	-99702300000
cmllu0sd7009xnw26veei2ux3	cmllu0sd7009wnw26vaqy329s	-90000000000	0	0	0	0	f	0	f	-90000000000
cmllu0gh8008dnw26sfpjylw0	cmllu0gh8008cnw26mlk7adg7	-44150400000	0	0	0	0	t	0	t	-44150400000
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, password, role, "talkshowPoints", "totalPoints") FROM stdin;
cmlltzo8t0056nw26qzcjztes	SUPER	$2b$10$JMn1Qs8irbw81J5MN6.Cre6DbSDk7CuAh8R6aOcBaOOeRrfX8QfJS	SUPER	0	0.000000000000000000000000000000
cmlltzop40058nw268s1gbhyb	BLACKMARKET	$2b$10$SrtEm/CsqJ/VnhXjhTh9BOCJayrpQSCHqU/7ei0LLo5Cdvw3MCLFy	BLACKMARKET	0	0.000000000000000000000000000000
cmlltzp0d005anw26v7bb6lyh	BUYRAW	$2b$10$jCT.BZ1L2rSBwHiz7TawtOibChbo9Hmu.ACnL7oeI1MpgEbypQT66	BUYRAW	0	0.000000000000000000000000000000
cmlltzpea005cnw26ce5uth4a	SELL	$2b$10$UCqLqjYR1hzck8ObmFF7d.2a10oNmptwuZ1lcU8dc8WHEjhVXFE0S	SELL	0	0.000000000000000000000000000000
cmlltzppa005enw26j7jbpehl	CRAFT	$2b$10$qLUYmhFhAseJSTAM0DVygeuqkohXpIgBQBzI7Vdm.7iEjVLzvQ0CO	CRAFT	0	0.000000000000000000000000000000
cmlltzq0k005gnw26sas5i763	CURRENCY	$2b$10$3vDQv2EUJII5vugtgvCsb.H.gzkN2T/v60FZjVsw/jfgA97kxXkPS	CURRENCY	0	0.000000000000000000000000000000
cmlltzqn1005inw26o781yll8	EXCHANGE	$2b$10$ATWX4OAFd2pBjOrs1Bpr3e7xM/pQNWWTVYjPGYacTF8Iiv.mfFtQa	EXCHANGE	0	0.000000000000000000000000000000
cmlltzqy7005knw26t3wiidf2	MAP	$2b$10$CY19PK9qTzBlbyOEYRdnf.9HHOMSobv8Q83SEDrMjOGZquI177kVm	MAP	0	0.000000000000000000000000000000
cmlltzrei005mnw26ki00k7h8	MONSTER	$2b$10$ACtB5Edms0BuQ/xLmmbfQeEdkKfpU4Fs65d2Kb09xsaGk39c5CXNm	MONSTER	0	0.000000000000000000000000000000
cmlltzs0n005onw26vzoy9dw8	PITCHING	$2b$10$V7X/Z5V3rK/6Jn2MBMCspulQZratN7xSLT9Ki02RcLMLeG97At8wC	PITCHING	0	0.000000000000000000000000000000
cmlltzska005qnw26s6id6alz	PITCHINGGUARD	$2b$10$uRM6NX9T24QRo8ZjKjjTYOdnKSqQ5qKH1lryYRB9m5D/lBYffV09G	PITCHINGGUARD	0	0.000000000000000000000000000000
cmlltzt0p005snw26gqajjfcb	POSTGUARD	$2b$10$ulFORxv8Bh/V7PC2wjpKKu3hzbNJehtY8y8doFmCwMNrLtxoeI/mO	POSTGUARD	0	0.000000000000000000000000000000
cmlltzthg005unw26v70011gk	TALKSHOW	$2b$10$FuJobRAGt7Yn3NGl4rWrQ.ooxj4dU4496WBUGi0AvJey50EToFiji	TALKSHOW	0	0.000000000000000000000000000000
cmlltztve005wnw2613gjtm2l	THUNT	$2b$10$FGp5kSMSv1A.msTUl8Anje5B3Hp2wHZxlmOxh/4MTeR5YAMmTH2aS	THUNT	0	0.000000000000000000000000000000
cmlltzu6q005ynw26jvent5e3	UPGRADE	$2b$10$QeRVd//XywH.Fot5xjrnqObmzZiFjqtWFBdtq6SACJUkLH0LVfa5K	UPGRADE	0	0.000000000000000000000000000000
cmlltzukg0060nw26heu6a6l2	NEWS	$2b$10$2Wrc7rsHVLxqWCaKOpn0HOAX9ti3KgXaPc8YBkYJhC9a0DQ8/JiEu	NEWS	0	0.000000000000000000000000000000
cmlltzuyd0062nw26wzaqu2kd	001_Trio Degem	$2b$10$98rTLV3er1efrszkPxukUeZgIS6Dm4SvyDjjUpObxJX3baP9dFlFm	PARTICIPANT	0	0.000000000000000000000000000000
cmlltzveu0064nw26bkctbuot	002_YanSiTon	$2b$10$.H2S0AxjK56rWsNmuW1xcuLUP5dyXtuE3IT7rDxDUPlxlJFr/xGsy	PARTICIPANT	0	0.000000000000000000000000000000
cmlltzxcr006enw2629qg9kso	007_Mi Luci	$2b$10$tgjgK1r7KdqFTwsp34WRsO4vnWJGnzjdSXkLLh17jv6BIf8rPSYEu	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0aow007ynw265hnqz0iq	035_trio bagor	$2b$10$.qpaU9eMq3L4z9/kmJ7OveFWr.tgdOF7Kd9Z4CRCRU7C3fTALqP/y	PARTICIPANT	0	0.000000000000000000000000000000
cmlltzw6n0068nw26ok4du3dg	004_KIRANA	$2b$10$rgF7m7tUqrkcJ/Rn8c.zHu4ev6vUOc6aEY0nIo5KRP78gkhkraMvi	PARTICIPANT	415	0.000000000000000000000000000000
cmlltzwho006anw267zl21k8v	005_Penggembira	$2b$10$ftb5rIRRz8IL7n2VmOo49eckAUTUCqogV6vS6tSmfJRKB7kKHvk.2	PARTICIPANT	279	0.000000000000000000000000000000
cmlltzwvk006cnw26z65htu3l	006_@ourlucky	$2b$10$ky0Ej3l6dGdRO/vrIdXVNecops.OqRcx13JOf0v0lGui0aRcJyUgS	PARTICIPANT	425	0.000000000000000000000000000000
cmlltzxsz006gnw26bpuhyqcp	008_BEBEK KAYANG	$2b$10$YLt9IelI5zbTyoH/MMGGMOvER.zjjIeCY0e0etUp9N19IKJ8dgM5W	PARTICIPANT	330	0.000000000000000000000000000000
cmlltzy4f006inw26xxw81zxu	009_cashback50ribu	$2b$10$u6guCo/tW626J49gHTJFWeCIAmaDh0VDyHwF3vaz4S1HMKQEQhSZm	PARTICIPANT	404	0.000000000000000000000000000000
cmlltzyhy006knw26ttb1zmjq	010_Indomie	$2b$10$N0CXUrrGNeyTSeTZKL6BEOTYhR0tXQTypy9i5Ymlmsx6C7N/qVoZy	PARTICIPANT	455	0.000000000000000000000000000000
cmlltzyqo006mnw26bgtbrnmc	011_triokegelapanpart 2	$2b$10$owZbuUAx2hR7tTj4LWmWie79U6VeEB6IkQiEa5Qbv4yQV3B7jLIEC	PARTICIPANT	340	0.000000000000000000000000000000
cmlltzz1o006onw26z5nw3ym5	012_Alyntika	$2b$10$SqAoS8dQ9QAW6rtF/I0aRu8.xccDT78owdKrR0PHVXpKpffSeFDQq	PARTICIPANT	451	0.000000000000000000000000000000
cmlltzzi0006qnw26o7eoh06k	013_morgancorp	$2b$10$gQgPBYv2ANbiNRrZgJiF.eIRbhT8VjJaWJ.JYx573MttouJdD37Ly	PARTICIPANT	400	0.000000000000000000000000000000
cmlltzzt8006snw26nr1ohyh2	014_Chasio	$2b$10$erah/iytAuwEh.eJidQBC.kOQiwZurq7elBay6mT81F9JXRQpPam.	PARTICIPANT	430	0.000000000000000000000000000000
cmllu004r006unw26vyr5kc86	015_RevenueRangers	$2b$10$O36FvQ6QoSKPmNvl4OhMu.9zfWC.DJUqVTzhL0tCeRubKbHDjOUsm	PARTICIPANT	360	0.000000000000000000000000000000
cmllu00kw006wnw26qae8g3az	016_Smart team	$2b$10$iaFoLzETUd1xhqg9SfE4iuMggjgLVmah3nGjccZRqBwCt4zsywt0W	PARTICIPANT	495	0.000000000000000000000000000000
cmllu00w3006ynw26cfg87gfh	017_capkakitigasiapmenang	$2b$10$nWC5rnUYt7J6H1EytXZPHu1PWykM1xSMVzNEasWxfu.RJq18D/T9.	PARTICIPANT	378	0.000000000000000000000000000000
cmllu01fk0070nw265m72m1r3	018_TRES	$2b$10$ckPyBKtHG6zRFT6U/HQbLONS7oKWtZoqecKFQOPQyilRSLo8q0OHW	PARTICIPANT	303	0.000000000000000000000000000000
cmllu02a60072nw26b19l6cpv	019_alleyesonELCIDA	$2b$10$Pggoql8HySlnH4tJhQrCZuqVtzdgYpRnrTJlJ468RcA4ctpufdQHS	PARTICIPANT	408	0.000000000000000000000000000000
cmllu03le0076nw26u43fd9e8	021_Wiwi	$2b$10$fZeE4LmNV01gho3oy4n8yeqOBlCDDzfbvXwozrDUuSeN8FfRp7ybS	PARTICIPANT	435	0.000000000000000000000000000000
cmllu044s0078nw2655z3t63q	022_trizzierssehat	$2b$10$MMZxS2Lu4W6XbNifDftLSOJ1uNZoT85z49CgD8BbQNeIECKELCuhS	PARTICIPANT	440	0.000000000000000000000000000000
cmllu04r7007anw2658mcrz6q	023_Pecel Juara	$2b$10$vrsj.P9vuLZhFa1MbmoOBuH/rmQWSbYIBZmal9XYZ4t4G0f80JVsm	PARTICIPANT	460	0.000000000000000000000000000000
cmllu05ad007cnw26zuyfiso4	024_threeleches	$2b$10$ja.tFOC3w8gGkIaBZrLw.Ov82rWQ0PL3BJXackbL64B04gouLaPbK	PARTICIPANT	405	0.000000000000000000000000000000
cmllu05wr007enw26qhxoziaf	025_GenAlpha	$2b$10$c8fwy4/q/oADBsnx22v/muZkuvqW8lp01LO43AmhFhwQomyJ5Wose	PARTICIPANT	360	0.000000000000000000000000000000
cmllu06j7007gnw266b846i76	026_SMAZAONE	$2b$10$Ky9qzffMmhVGAWHg6MMf.uts7Ft5l59o1PVVfcvt6oFhxAm/O9Ai2	PARTICIPANT	433	0.000000000000000000000000000000
cmllu06wy007inw264dm5fgfh	027_Trio_Limbus	$2b$10$5ZEsPUEsBkdpd1zYBnkz9OVYiFZkL84QbmpL4y8SfVfDZQq9zXxjW	PARTICIPANT	423	0.000000000000000000000000000000
cmllu07dj007knw26ajbfnas1	028_SMAZA TWO	$2b$10$3B.3Ff/grnixwXHtup.LhOlqgNgdrz6hftmRay9A3Zgl/tK.OjDuy	PARTICIPANT	495	0.000000000000000000000000000000
cmllu07os007mnw26m4mfommf	029_himmel	$2b$10$Vkp5E05xRXZ/KTtuFuYhdOcLwlLL.gUL2/CRf0uaDFJWx1jFwjeR.	PARTICIPANT	380	0.000000000000000000000000000000
cmllu082g007onw26ngrgblmg	030_bobok siang	$2b$10$Jdaaa9f2xDhSyIU2YL00WO/goagodaJa1iyNb5EHT0V4gefKqLQgW	PARTICIPANT	408	0.000000000000000000000000000000
cmllu08or007snw26xe94e7ly	032_anton	$2b$10$RaVJL38E1I5x2TikBmplaenOzytYjhfv63bmXkkUpLKucWJfho..W	PARTICIPANT	528	0.000000000000000000000000000000
cmllu095j007unw26hvsqh6fh	033_TERSERAH	$2b$10$teKH9nSSqM3R/rPdZC/hMO7JUEqUCGv3PM52slgQdv0UBIWapn.ia	PARTICIPANT	477	0.000000000000000000000000000000
cmllu09jj007wnw26gt903jbv	034_Hustle hive	$2b$10$htQFGK4hattxi1caKn0PvOO6xjV084FOn2IHiX16Mwj9sN827UvK.	PARTICIPANT	475	0.000000000000000000000000000000
cmllu0bdv0080nw26zfj0le9u	036_Elionix	$2b$10$qCx4W3XoWsNTyXIfCFOwfeJ4AOXygmi8sC7in7qoEE8C6jp6KXTvG	PARTICIPANT	406	0.000000000000000000000000000000
cmllu0bxd0082nw26rnea0tz5	037_Tjahaja Asia	$2b$10$VD8tXVH62MTgNzRP0MmlQuMxKpWZvMp7UaRwyX6efCBiiL9/0anG6	PARTICIPANT	503	0.000000000000000000000000000000
cmllu0dry0084nw269ouzezpe	038_Goblin Gang	$2b$10$zj72gw7PX/aUeL60.ZHRfeXBXazZk5Y8jml380P6hV2RDO7Fk8mXu	PARTICIPANT	370	0.000000000000000000000000000000
cmllu0ep90086nw267o9q98jc	039_Pejuang bitcoin	$2b$10$5DKCeFjWtPNEizzZHz46HeOYUnWLoL4tX5IxPVb2ChYydUxkwy6CO	PARTICIPANT	471	0.000000000000000000000000000000
cmllu02z70074nw26j1trbg2g	020_eltimi	$2b$10$c7F0c9J3.7MF.m3fsAdY1.2JrFPO8W7Q/JnEvVAy77hviv5z3n6na	PARTICIPANT	454	0.000000000000000000000000000000
cmllu08dp007qnw26azxec0z3	031_Cihuhuy	$2b$10$Fi.ZxnN7yGteAqqN58QDgulxAFlqJgKJvk/oi2F7pf4taB/xDTgBC	PARTICIPANT	355	0.000000000000000000000000000000
cmllu0fxy008anw26vmmmf5py	041_Pocky	$2b$10$9suk.4YRGNmJKdCyd2hTKev1Xgzt.Q6Ai98MuuJY3plr83PoJ/QJW	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0key008qnw26k1yd7dl0	049_GOAT TEAM	$2b$10$fsSxfN8SHFpR47XXCPPiKeBzxaKBX/hBxTV7SDdsgdU43h8dF0S3.	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0lkq008wnw268oqo0p2k	052_the blue	$2b$10$fPNCfEyxvFYB8yVol14PNeovCSasgzDWgWIoyyIKzv72/6zsw6YbC	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0lyf008ynw26wzrokbnt	053_SABUN LIFEBUOY	$2b$10$/odtpv.p1ZKBFj6u1EL2aOIwz5cF.ljP8wou8Q9KVuQIQ9wZkH.Pm	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0mci0090nw26ehbbq9nv	054_gacorr	$2b$10$ln0VEHHZ2IBw8wWbf4TGLuwINXzEjFcpUbw2syyzdWl7ACLWif0H.	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0nfh0094nw263ap9l1qc	056_TIM Gwachor	$2b$10$IHQIDM4wOFNxJsoScIm4JOcdV5nTngKDWsenDebug.My6DOhMfeJq	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0ntb0096nw26o13lvjde	057_Uganda Forever	$2b$10$WCwZ62URjpqzL9nJxy..WuMESl0fDv3xEzMXKPNDZmCM2aqW6k92a	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0oqj009anw26f779vzy0	@ourlucky	$2b$10$v4jykTrJuwpOx0.RUJ459urkVyAQ48KmL35y15C8e7Jzkt4RldaBC	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0p4d009cnw267n81fa5i	Chasio	$2b$10$1gFheazN0yGmic61D2YcS.ajK9Fss6bz68gt51ZfLgy7HFmY63X7O	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0pft009enw2673nrx5up	LombaSabtuMinggu	$2b$10$iuv2VykhHfS.rFqBLRwR7.ies2uMdY6lexUfLuTau1WkDQhYdqf/y	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0pqu009gnw26wwonajk5	ATHENA	$2b$10$h2Ko8kZyYkF7JV79IFt.TOxN4KQdF5ZleTqQqczF.O/QJ9O646WqO	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0q4r009inw265lzkmcks	triokegelapanpart 2	$2b$10$Jbf92B7nAgItMxwGI4XmJeQ0SeugsGsECmKLqSYzVgB7cFcZkQo9q	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0qfr009knw26rmucf43d	PBBJB	$2b$10$P83S17to23ray2gqBFKPJONPXrztz.0AhGfOm3yihoRjtUhTu389a	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0qqu009mnw26mxm58yt0	Pecel Juara	$2b$10$LzQ1JZ4307HXWxjKYU/Sk.Abef9MKM1evYdVkrSRMkQKfC2p1tp92	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0r1u009onw268jm2o436	GenAlpha	$2b$10$X8nWY5l77gaWF.dp8.6mxOaNMKBC.zOxQ21Y6xJB5wpBYrusR2116	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0rcs009qnw263e9fnfv2	himmel	$2b$10$c6k9x2WJv3Y4bdHqjuqUTeQLat0Rm5ZsaMyW2LhZn9EUtEj6mkUDC	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0rny009snw2660lasy3h	RevenueRangers	$2b$10$HPTm1Kcz7XRP3U6wd9bhsO8.nQZrel6eqVmRZpjm8QnNy52AC8Bui	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0rzf009unw263llq5js8	Kwak Kwik Kwuk	$2b$10$2HGcPyfokgQZ2OvJ7WqU8.8gzTgmjW6dTUGGb9VLdqM/KiASZuc7S	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0sd7009wnw26vaqy329s	Husky	$2b$10$G1AAt.XEGIvWV3yNOYriO.DWj59.3gu2VP4tFTske7UliGZfplh7G	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0sqs009ynw26x7k7zy1t	Pejuang bitcoin	$2b$10$IW22h8C7BkWmzkzybKFxy.tUq1FT/boo0ZoJYYePK0SIbtKUQCL8u	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0szi00a0nw263jl3tucr	Tjahaja Asia	$2b$10$e2WgUUHZ1WNGYQl0buE4RuRpVJx7Uy7zIwZmpe47v5J8nsS0XjMCm	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0td800a2nw26o2u0qnp4	Circlefarminitiative	$2b$10$3fxDHYeheVFKjBkj8gIDuOxpPyYNzqZJNolmBu2X8YqWbKkswciNe	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0ulj00a4nw26vnu9zram	Cihuhuy	$2b$10$8WEBGKsoxacdZYkMF5HlD.ArhnkQCrYo62Ro9anQEKXySepOzCO0u	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0uzj00a6nw26l34vsr6i	trizzierssehat	$2b$10$vDgy6XuxzYaIsJFfUnuK8.Ib151a8Mry4cHuX1hSUJIMjgxz20oOS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0vav00a8nw26lbckuoaw	threeleches	$2b$10$.x9NaYUEz/kyK5yhlvFWnu2rEM9/9saDYcOyXbxdSNAMLZgRRZsUS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0vwr00aanw26yff03n33	Indomie	$2b$10$5dExR.FBpl5lqf1u7ifh1.rr0uuW6DQ1aCAti2qsqpBI.6nKkQU9O	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0wg800acnw262m7ttzzw	Alyntika	$2b$10$ye2jQTLBQX6yLjq374wn5.ZLft0tXluSjcjRHap05x8PYOz0P3RO6	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0wra00aenw26ufu47wxz	Hustle Hive	$2b$10$6MEzsi1ECs74rr6ige7xOu9E/xLYnf9JpMy/2r70/2q6monbgosIG	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0xb100agnw26h6qmqvug	TERSERAH	$2b$10$VorNfwl7T5KQAU7wdsHoTuwmSVZGb7d0hSHHWp2NdvEwlGYtm6jKO	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0xuc00ainw26mcjjtj51	SMAZAONE	$2b$10$D3IHsiAHVv5ulX0EST6bhOxhqYSa597wqsSx1JgXNbIBeK2mA.ozm	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0yb800aknw263arqi19j	SMAZA TWO	$2b$10$BF0UVMe5LzLMEE.b5vuss.Qi2K18DPu8k97YSbcTqQ1zKl1hw5URS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0yuc00amnw26uij0ng2h	Bikini Bottom	$2b$10$dZJ0aR81T/JsPSzPwtA1ae4aA1H.1jY3iKVVlfla9g6B4qMV2.OoS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0z8f00aonw26kgqvcibb	smazaone	$2b$10$rsEBKUdAFV4XkxsVTvcXROgA1.J5yHfU7g.UXMsguIAzlEKr8M3pK	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0zjl00aqnw26ftj5lgb2	Penggembira	$2b$10$CAmoYGtRs/XLA7FmGw3w/.Z9tbF9UmTJjT8/N4d.7.iDuOsOak5xm	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0zup00asnw263llxk1mp	YanSiTon	$2b$10$vOXznA/iiWmEsthAjWrLJO.CTRzb0gWkCpIIh56VtfjTycEM9Ifem	PARTICIPANT	0	0.000000000000000000000000000000
cmllu108800aunw26fyalyad4	Pocky	$2b$10$21Lu3dDotFvCULgLqCdrKeu.OvHBGghwd70XQYcfTeEm.HZQcNMt.	PARTICIPANT	0	0.000000000000000000000000000000
cmllu10jd00awnw26cpp0m5gg	anton	$2b$10$D60GM7E4RxNhig7SWQbknO95gpVJbY/K0vWzfB9PJgaAHd1suNsMG	PARTICIPANT	0	0.000000000000000000000000000000
cmllu112u00aynw26rfge283j	TRES	$2b$10$2fxDziMx2PzKIxPXMFu56egGOoHBRxd/BbEzomrwYCR67mRtG0Mfu	PARTICIPANT	0	0.000000000000000000000000000000
cmllu11p800b0nw26e7cmevk0	NalaImpatc	$2b$10$vIiMMgkSHBPz32ZoLTp2xOfEJUAqrBb7LMWkh/ODt5AUmb/odYJ56	PARTICIPANT	0	0.000000000000000000000000000000
cmllu125p00b2nw26q5ruf0n4	NalaImpact	$2b$10$5xreuEvHYiXkbEVrX0QV.O2d5lPzjQJQiVZkAM/8aL1YDhQmT3jNS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu12gw00b4nw26esvmmr22	M3nangAmin	$2b$10$V7843J9aTXbyi/tSjPGcC.yU1XdeTRRljFp9HtYR2hShs2Mjxa3Y6	PARTICIPANT	0	0.000000000000000000000000000000
cmllu12xr00b6nw26hz5pl2vo	morgancorp	$2b$10$heCfzjzbKtubQV1jKP3AEehRQsgKLbz45wzKQfXzhNXyqnoT62QXy	PARTICIPANT	0	0.000000000000000000000000000000
cmllu138l00b8nw26rmi1vp51	elmiti	$2b$10$hBrHqRk//7RLlTdXE3a1kOl84kp0BAes9HODywTZJlQQaL54.NLpS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu13jq00banw26vpuioxve	Trio_Limbus	$2b$10$TqwXBt4XrlrF7uj4jacqUu6z66ea2w.zfO9qRw7fDZXW9vz5K5.eS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu140h00bcnw265h647jqa	Wiwi	$2b$10$c96fLVMvoZvPEjNAPqQIWO/lKM6xMtDFSZe2xWR1aBK0eUrItBTSG	PARTICIPANT	0	0.000000000000000000000000000000
cmllu14jx00benw26anykfz44	capkakitigasiapmenang	$2b$10$vkhoOBnA02AX0dmBu3N0OugbEOOYR32KvUe/9MrO5jcHGkpcKppNG	PARTICIPANT	0	0.000000000000000000000000000000
cmllu0hmt008gnw26908yrmiz	044_HapHoo	$2b$10$PzL4gOKEKdFgPFh9Xl2ONOhI5RDr3KOtF14x1Mo7WJZvwnX0ItbS6	PARTICIPANT	423	0.000000000000000000000000000000
cmllu0i3j008inw26p9xbk1q1	045_NalaImpatc	$2b$10$3axpBhSaICdvtGmRgiGTv.K66QoRvcbRnIm736smm0J76vnEk94Hy	PARTICIPANT	485	0.000000000000000000000000000000
cmllu0ihs008knw26uxndqk65	046_Circlefarminitiative	$2b$10$8wl1Bne0LJQlOyVTcllys.p.E5jsDmKqsAnuGiES4KhGqdZTRz6hG	PARTICIPANT	430	0.000000000000000000000000000000
cmllu0j13008mnw26lqw4m9f8	047_Husky	$2b$10$r5i2TB3KVz9jtQTf7fR0JOBiQ8hN90H7VX6TfNZeKWVPo52FDWmAq	PARTICIPANT	570	0.000000000000000000000000000000
cmllu0jsw008onw26d3yg6n7a	048_ATHENA	$2b$10$KPqQ2I3jpD8P3JAvsC1DdewF6p.yQVi13da13SqlfYR7wywf6zkCy	PARTICIPANT	536	0.000000000000000000000000000000
cmllu0kvl008snw26fnx0ym7n	050_LombaSabtuMinggu	$2b$10$9S7XTymAV8EpPnOgEmiTIeuy2ZAStJhDoSKplBc5wnkmFJGC3iPwS	PARTICIPANT	379	0.000000000000000000000000000000
cmllu0l6u008unw26j7pjdm96	051_CELITA	$2b$10$GaSInn6x4w.o2Te2wPep5urSGwQ4OuCyZ0QCObcVqAwMD2aDjcYty	PARTICIPANT	437	0.000000000000000000000000000000
cmllu0mw00092nw26iladjbb1	055_PBBJB	$2b$10$110LyLXcdrFoLCM8FRBqUeFtWs/1G1/TRhZEYoFI1z/5ofrxKK4Iq	PARTICIPANT	510	0.000000000000000000000000000000
cmllu0ofe0098nw26e7xaoeze	058_eternityx	$2b$10$DF5gui/MpmijJvVpJPgj7OZKJ4L6PwrtOFg7j2s0qEQhfiBWHv8Zi	PARTICIPANT	310	0.000000000000000000000000000000
cmllu0gh8008cnw26mlk7adg7	042_EQUINOX	$2b$10$87CGL5amxa62XiClJbMEA.F5JG56FU36qUcyl1EINHAg3SOIaNA9S	PARTICIPANT	470	0.000000000000000000000000000000
cmllu156600bgnw26v1vz98yp	KIRANA	$2b$10$n53hJTsjI22QvOPl9KxVre63dMFXMqfEu/ipWZnB6v.NTxHsNuIBu	PARTICIPANT	0	0.000000000000000000000000000000
cmllu15po00binw2662m5a31b	CELITA	$2b$10$Edquq2I5C9dsopDNQxBDHeQUIlhlyCwF8ZoA6TPAx/uNXU3x.tzY.	PARTICIPANT	0	0.000000000000000000000000000000
cmllu16y900bknw26qu0bkk62	alleyesonELCIDA	$2b$10$gugvMYB756PJVm2lp4ndi.bFtIwMpQLNHKxNda0r0LWck18PgtlBi	PARTICIPANT	0	0.000000000000000000000000000000
cmllu17ve00bmnw26m89dtpj6	EQUINOX	$2b$10$seG9WRGd2LANbsZ3GKt4JOh.Rx8PXlP1TFjQdxc0SPvVssFnQwxPm	PARTICIPANT	0	0.000000000000000000000000000000
cmllu18px00bonw26qwry5a3m	HapHoo	$2b$10$ZnKYbQ80t2hnmj.QSmORdujIf2CP5ByGfsxVrczVqzr.8mvnmtVJS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu196l00bqnw26xrrsjyue	lennoxx_	$2b$10$bbLtpcX0FNIqDve4hzwOP.i2.LCZy0MKDFixfb9XLjAF8d0WAQ6oO	PARTICIPANT	0	0.000000000000000000000000000000
cmllu19kg00bsnw266w9v19l5	cashback50ribu	$2b$10$5s1rnWBuaEx8uu89Tu/mG.QN0EjNB2WTs343s3l1UhE0kUt7Frf.y	PARTICIPANT	0	0.000000000000000000000000000000
cmllu1a1c00bunw262qt8053m	BEBEK KAYANG	$2b$10$/cyjWLtGx51w9EeDlMd0Buf/nvhlEUCVeJKBksbMViGgMQEV39LH.	PARTICIPANT	0	0.000000000000000000000000000000
cmllu1aq100bwnw26vjgyqzks	Smart team	$2b$10$q2g2CPunWk4th8eHVwUBdO42hucRFsk44ZXfcq60qFWJY9q8qphaG	PARTICIPANT	0	0.000000000000000000000000000000
cmllu1bcb00bynw26nm0a0ob0	Hustle hive	$2b$10$.T8pMXiH7Wr2GrCnhz5bD.yCrt0s02jZSBMASTeSgAEQdSc2FLIXS	PARTICIPANT	0	0.000000000000000000000000000000
cmllu1byq00c0nw262y9h83ia	Cihuhuy uc	$2b$10$Mp8I4qy2X.Kd.8YNkHVErOVPTEw.1IbYqOy46KSGg1khC6qxz9v/a	PARTICIPANT	0	0.000000000000000000000000000000
cmlltzvq60066nw26zepilfjz	003_Kwak Kwik Kwuk	$2b$10$1csVSODlOCNCRv3fZF8N2uFoICBwFYxzYW7fr6sqtndgTB7ZBCI4y	PARTICIPANT	440	0.000000000000000000000000000000
cmllu0fek0088nw266ta8w83u	040_Semoga Menang Amin	$2b$10$GTCgOTVIbODBYR/Ggen4N.Kt4WJTDcvC86pWK.234cT8LnleYj4Lq	PARTICIPANT	388	0.000000000000000000000000000000
cmllu0h0u008enw26n48e0w6j	043_Bikini Bottom	$2b$10$XaNT5BB8ZDMqzQxArzF6l.633R5y7jLKEXK/.vQYUnq.NBORMxURq	PARTICIPANT	441	0.000000000000000000000000000000
\.


--
-- Data for Name: UserBigItemInventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserBigItemInventory" (id, user_id, big_item_id, amount) FROM stdin;
\.


--
-- Data for Name: UserSmallItemInventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserSmallItemInventory" (id, user_id, small_item_id, amount) FROM stdin;
\.


--
-- Data for Name: _RallyBigItemToRallySmallItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_RallyBigItemToRallySmallItem" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e37634af-37bf-4240-ab66-544418853350	fd80b82296ac21fd16a2c9c4b7fad4d40422915f79f8371ddba0940917766a7f	2026-02-14 04:42:57.702207+00	20251214171154_change_trading_schema_for_timer	\N	\N	2026-02-14 04:42:57.603101+00	1
9b6fdb99-45a6-45dd-b48f-5192a8caf971	206fc138b75fcb7374442de248b20b938273bdce7ae7edc64ccbec7b0c5ab5fa	2026-02-14 04:42:51.703894+00	20251213044021_added_all_schema	\N	\N	2026-02-14 04:42:48.100192+00	1
84650ec7-72d0-4fc7-959c-2f1bec0111a7	e1db2e3946b02c98ae776c83c17096a231363e1e6282cf3ee620288ff4f1fd2b	2026-02-14 04:42:55.899436+00	20251214100225_change_prisma_db_rally	\N	\N	2026-02-14 04:42:53.998559+00	1
b4d20d2d-1e02-4f04-863c-4fd88668fc75	0026df653190a05851ed82cf314b1e6f26eb0055943fd1c7f3c866685499a63d	2026-02-14 04:42:51.804897+00	20251213051035_update_default_trading_data	\N	\N	2026-02-14 04:42:51.705383+00	1
939b434c-166b-458b-a081-3cf777d71a66	4c2a9990a9b6f88ffbf34a1a07cb57a1810b5fb8a819e86d0dbc4bf3602adb06	2026-02-14 04:42:51.997216+00	20251213065224_update_default_value	\N	\N	2026-02-14 04:42:51.900958+00	1
5aae3394-d102-436a-8ec0-ffeb22d73b23	6196e3386543d32a476fbf8e0721624de0d5d5d1b3b6b4930126afac76941080	2026-02-14 04:42:52.201032+00	20251213071130_update_unique_periode	\N	\N	2026-02-14 04:42:51.998142+00	1
d9f28a55-061c-4831-b688-2aafe23da092	2955b93c8ee5109b3038a34686e30673abe6bded8d454a83f303b99787f98dd7	2026-02-14 04:42:57.003739+00	20251214110804_change_rally_database	\N	\N	2026-02-14 04:42:55.901005+00	1
e1899421-d5ff-473f-b494-4fc11a02acda	e077f54ed0eacb190e37e25a2853a2021e6676419c1f537d629226f817a045b7	2026-02-14 04:42:52.300033+00	20251213083940_add_admin_talkshow	\N	\N	2026-02-14 04:42:52.204961+00	1
ea30330b-04d7-45f9-87ac-0d50ea17caf5	8d4692968b694bbfb7eb71b0f97d2960f62ea5be0bf2796c2bb8395bb19ab065	2026-02-14 04:42:53.197827+00	20251213145719_update_elapsed	\N	\N	2026-02-14 04:42:52.302721+00	1
22a6adc9-8c14-4d7e-a15f-cbfc01e39ca2	a62b05ae97303efdc016d14fb7a0849c4e6de1a6bf1c38766501529e8b883951	2026-02-14 04:42:58.704296+00	20260107102633_add_show_in_inventory_boolean	\N	\N	2026-02-14 04:42:58.700636+00	1
fca5d2d6-3208-4b8d-b215-3b9fcb9661cb	7446358a98a5241567bee85d3df898e5fe490be4b804d62d17853bcf5496e5fa	2026-02-14 04:42:53.397684+00	20251214031724_delete_email_nim	\N	\N	2026-02-14 04:42:53.199855+00	1
0a670138-fcb0-430e-ae69-f31da3e10f09	20e1ff30cdd00760ba670090fd8fe040bdf546708f74af3ea65810ce334549f8	2026-02-14 04:42:57.10075+00	20251214111428_add_eonix_cost_to_rally_pos	\N	\N	2026-02-14 04:42:57.005267+00	1
5220e61b-66ad-47bd-ae83-02b3ab188811	e629a8994ee7ce2ea7d297bda47eabfcbc811d09fe6ec6f5a3d0719a95fe63c7	2026-02-14 04:42:53.49939+00	20251214035548_tambah_admin_role	\N	\N	2026-02-14 04:42:53.400831+00	1
9864fc3c-54ee-4aec-94a5-b56a2cb6062c	bec54b3dfa76029568ec6ab14c69c81ce4fcdc14ad15e37ed2e9db52a8ed9957	2026-02-14 04:42:53.504669+00	20251214045847_update_attribute	\N	\N	2026-02-14 04:42:53.500333+00	1
024b80bf-c57b-4b02-b134-a2eb119d38db	cf9f76e087702fa372483e312fb39c1abc647240f68e3f3acbbef65c3137a9f0	2026-02-14 04:42:57.899805+00	20251214171536_cleanup	\N	\N	2026-02-14 04:42:57.703256+00	1
0bcfc9ea-ab53-46d7-9fff-10bfb273141c	7c27f1cd95da4da8a7d2999dfd17e84d4adf7c2ab8eabc59b4766fda20a8861e	2026-02-14 04:42:53.601987+00	20251214051841_add_created_at_trading_log	\N	\N	2026-02-14 04:42:53.505603+00	1
03f0d1e4-0568-4aa5-8b89-d32bd0e2729a	5a42e695d13c922a862e2b7d0facc0834ffd56e3a1000bbc34e6723aacc85b62	2026-02-14 04:42:57.199719+00	20251214111509_add_pos_name	\N	\N	2026-02-14 04:42:57.101758+00	1
9b2f9917-8acf-4d80-9ecb-9ac4a49c64cf	c461d2f3171d05c8fa651d71fcad502f11be6dbf8afc95da1fba098aa0119646	2026-02-14 04:42:53.796525+00	20251214053142_change_admin_role	\N	\N	2026-02-14 04:42:53.603011+00	1
e2f9f9cd-bbb6-40ed-b12b-f073e3251733	74476a3700539d8fcf53f7f508ee511f53f4c663ff1d212bfe07ed7d408fba9f	2026-02-14 04:42:53.800967+00	20251214064409_add_pressure_admin	\N	\N	2026-02-14 04:42:53.797499+00	1
991b8c72-b756-407a-ba71-f5867d3c2503	a85b9d486e34142aaa29a83615e74210add6dea8f04eb4d0d7ce80b46499ad89	2026-02-14 04:42:53.90745+00	20251214092311_add_level_upgrade_cost_rally	\N	\N	2026-02-14 04:42:53.80172+00	1
3ac78ad5-0646-4bb6-b0fc-a662c504ebda	f299f0dc4650efdcdec1d9f3d16858f7bf4f6a1ae1110f9700cf2045bf4b6f9a	2026-02-14 04:42:57.300857+00	20251214143850_fix_errors	\N	\N	2026-02-14 04:42:57.200639+00	1
483e4bb2-d281-43ea-b912-6375f67c3034	e4c50d11408476ef149b678f585e940c34b9ed63120da7f67a8f9ce5d0cc1029	2026-02-14 04:42:58.601988+00	20260101120212_add_master_trading_relation	\N	\N	2026-02-14 04:42:58.498887+00	1
094bfef9-4c58-48a7-8e3c-718b387d94a2	022e4bed87bfea9ec5332038860313887a5d6104e5644f5d7827f3b2695705e3	2026-02-14 04:42:57.49945+00	20251214152550_leaderboard_live	\N	\N	2026-02-14 04:42:57.302027+00	1
fc740e9c-bcbc-4279-b2c1-ab05852a164b	a649279615fb65921052b5b3291aef22a799c40aaf2e9560899c2d470bd7d696	2026-02-14 04:42:58.200898+00	20251214182839_update	\N	\N	2026-02-14 04:42:57.902467+00	1
67406ce6-7af7-4729-a038-293728f101e5	d4f12d094fa1587ccaa362c2ed5a1b7efa34a1dea2951c71271a815ec1f62100	2026-02-14 04:42:57.598404+00	20251214152935_nullable_date	\N	\N	2026-02-14 04:42:57.500503+00	1
01475098-62ba-4269-acd9-8ed178e29c3a	b1fa708664b8bdc1e94f6b19acad70f20c0abf717e52ee28ea2a1b6e69e3a8f3	2026-02-14 04:42:57.602258+00	20251214153244_add_pause_rally	\N	\N	2026-02-14 04:42:57.59941+00	1
12ce6214-cee0-4326-8d65-eb81371397cf	f77d1dca3604477a8eb346853f42a2ddd9be746d26ca73f4f19686b661006a40	2026-02-14 04:42:58.298868+00	20251215003148_add_craft_recipe	\N	\N	2026-02-14 04:42:58.201852+00	1
0421653b-dedd-4c1e-a50f-e3f70013ecbe	62d4e7e4f5520d215107c0d370f78a75be53ccaee8183b0d3b5b4e5c60aab8bf	2026-02-14 04:42:58.606011+00	20260101121259_add_total_period	\N	\N	2026-02-14 04:42:58.602763+00	1
01c01612-6746-4e76-9178-dc872848a8d8	6602101175908d33f8c5d071226b1524d753e1b5324d6ca4fa38266799e97638	2026-02-14 04:42:58.304168+00	20251215005312_addpricetocraftandrawstockperiod	\N	\N	2026-02-14 04:42:58.299794+00	1
a0f5d8d7-75b0-477a-8d22-89d4ed7b8b38	71d19e8b9d59bd622906d2e13bd0174cf297093c6d65f7d136cd9fe0d0fa94f4	2026-02-14 04:42:58.497395+00	20251215020726_add_map_recipe	\N	\N	2026-02-14 04:42:58.305426+00	1
c303366e-68cd-44a1-9163-ed7b50355a5e	b1b85b23d1eb84468663c00b5e7257e6a761f38d12958e8f1edbf18bbecfab3e	2026-02-14 04:42:58.699799+00	20260107102403_add_price_to_rally_small_item	\N	\N	2026-02-14 04:42:58.606779+00	1
6101b949-66d0-4e6b-9b21-3bbbc44114fe	d03186390b88fcbe7300b07d104c1c97a5313ebeaa8a4eb0279fbd7ba564a7f2	2026-02-14 04:42:59.002509+00	20260111172657_make_price_different_for_each_periods	\N	\N	2026-02-14 04:42:58.804516+00	1
342e89dd-15cc-4280-bc78-8b98b677b0e3	2b159a0375d763c176420073c23ff03bb6a0d45d9cd24d39463f986d74fbae2e	2026-02-14 04:42:58.799448+00	20260107103712_special_ticket_rally_period	\N	\N	2026-02-14 04:42:58.705069+00	1
8927b062-e5ee-482c-af1c-0a6189233697	e599e4ed5185d3d3213ab0325fd354fedbf7aaedbd920a3e36c052f791b09b1c	2026-02-14 04:42:58.80372+00	20260111152224_add_usdidr_rate_per_periode	\N	\N	2026-02-14 04:42:58.800721+00	1
dafd9064-0a69-4633-892b-1505463fc518	7ebdd7e120bfbb7562499b6e4c17f112aaef64634e58698aa27212fc91b0a3d7	2026-02-14 04:42:59.100162+00	20260114181804_add_global_point_and_talkshow_point	\N	\N	2026-02-14 04:42:59.005201+00	1
17c06a7d-d9ab-42c2-802e-5a12e50602b5	80a2da1300be20d4cb690266d6368c6660261887e549a48ab2a02b493a0d9f64	2026-02-14 04:42:59.198657+00	20260115080537_change_default_eternites_to_10000	\N	\N	2026-02-14 04:42:59.100942+00	1
f6dfbb07-972d-461c-af8d-e2c0f02198d7	a1362f60a87443621ae4b6dd92aea208d94611ccfdb58a9323f2c3ca6a8d3086	2026-02-14 04:42:59.205207+00	20260115121647_add_news_for_each_periode	\N	\N	2026-02-14 04:42:59.200729+00	1
eaa708c2-08db-432e-9535-cd810da1ed76	feeff591a9cf98026ca873065aa958c4aa026156e329f552ac02606682dffe46	2026-02-14 04:42:59.301308+00	20260123070757_add_had_pitching	\N	\N	2026-02-14 04:42:59.20607+00	1
3862753a-caa7-4e1a-b9c7-df4ae7d99cfa	a8f62d6322b6039f3eaaf385b4bed090c641198fe0972663317c387ed9885f13	2026-02-14 04:42:59.304873+00	20260124042937_add_final_idr_field	\N	\N	2026-02-14 04:42:59.301995+00	1
f28935d7-f703-43e5-a3d5-ed9ed7c3121c	f07d43a2e20e4b9c449bc8fccf5c580a4df8e37d894240375fb358949078d49f	2026-02-14 04:42:59.400828+00	20260126032751_added_role_news	\N	\N	2026-02-14 04:42:59.305838+00	1
e13fb477-be4f-4ec9-bcd5-e10f0f7f1c34	52cb6bf9f68fb5229bfb2512cbd1e871c6e7a7f28425b58dbee81bc8e4a8aaca	2026-02-14 04:42:59.897132+00	20260214025025_change_amounts_to_bigint	\N	\N	2026-02-14 04:42:59.401775+00	1
67d45241-2175-42fa-811f-92bdbbc0e5ca	7bd5b5c16475546b34d078ddf29c65507d91e82b325f200fc623563e00544853	2026-02-14 04:43:00.301832+00	20260214041447	\N	\N	2026-02-14 04:42:59.898255+00	1
\.


--
-- Data for Name: access_card_upgrade_cost; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.access_card_upgrade_cost (id, eonix_cost, big_item_id, small_item_id, big_item_amount_required, small_item_amount_required) FROM stdin;
\.


--
-- Name: access_card_upgrade_cost_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.access_card_upgrade_cost_id_seq', 1, false);


--
-- Name: BalanceTradingLog BalanceTradingLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BalanceTradingLog"
    ADD CONSTRAINT "BalanceTradingLog_pkey" PRIMARY KEY (id);


--
-- Name: CraftItem CraftItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftItem"
    ADD CONSTRAINT "CraftItem_pkey" PRIMARY KEY (id);


--
-- Name: CraftPeriod CraftPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftPeriod"
    ADD CONSTRAINT "CraftPeriod_pkey" PRIMARY KEY (id);


--
-- Name: CraftRecipe CraftRecipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftRecipe"
    ADD CONSTRAINT "CraftRecipe_pkey" PRIMARY KEY (id);


--
-- Name: CraftStockPeriod CraftStockPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftStockPeriod"
    ADD CONSTRAINT "CraftStockPeriod_pkey" PRIMARY KEY (id);


--
-- Name: CraftUserAmount CraftUserAmount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftUserAmount"
    ADD CONSTRAINT "CraftUserAmount_pkey" PRIMARY KEY (id);


--
-- Name: MapRecipeComponent MapRecipeComponent_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MapRecipeComponent"
    ADD CONSTRAINT "MapRecipeComponent_pkey" PRIMARY KEY (id);


--
-- Name: MapRecipe MapRecipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MapRecipe"
    ADD CONSTRAINT "MapRecipe_pkey" PRIMARY KEY (id);


--
-- Name: MasterTrading MasterTrading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterTrading"
    ADD CONSTRAINT "MasterTrading_pkey" PRIMARY KEY (id);


--
-- Name: PeriodeTrading PeriodeTrading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PeriodeTrading"
    ADD CONSTRAINT "PeriodeTrading_pkey" PRIMARY KEY (id);


--
-- Name: RallyActivityLog RallyActivityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyActivityLog"
    ADD CONSTRAINT "RallyActivityLog_pkey" PRIMARY KEY (id);


--
-- Name: RallyBigItemRecipe RallyBigItemRecipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyBigItemRecipe"
    ADD CONSTRAINT "RallyBigItemRecipe_pkey" PRIMARY KEY (id);


--
-- Name: RallyBigItem RallyBigItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyBigItem"
    ADD CONSTRAINT "RallyBigItem_pkey" PRIMARY KEY (id);


--
-- Name: RallyData RallyData_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyData"
    ADD CONSTRAINT "RallyData_pkey" PRIMARY KEY (id);


--
-- Name: RallyMaster RallyMaster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyMaster"
    ADD CONSTRAINT "RallyMaster_pkey" PRIMARY KEY (id);


--
-- Name: RallyPeriod RallyPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyPeriod"
    ADD CONSTRAINT "RallyPeriod_pkey" PRIMARY KEY (id);


--
-- Name: RallyPos RallyPos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyPos"
    ADD CONSTRAINT "RallyPos_pkey" PRIMARY KEY (id);


--
-- Name: RallySmallItem RallySmallItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallySmallItem"
    ADD CONSTRAINT "RallySmallItem_pkey" PRIMARY KEY (id);


--
-- Name: RallyZone RallyZone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyZone"
    ADD CONSTRAINT "RallyZone_pkey" PRIMARY KEY (id);


--
-- Name: RawItem RawItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawItem"
    ADD CONSTRAINT "RawItem_pkey" PRIMARY KEY (id);


--
-- Name: RawPeriod RawPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawPeriod"
    ADD CONSTRAINT "RawPeriod_pkey" PRIMARY KEY (id);


--
-- Name: RawStockPeriod RawStockPeriod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawStockPeriod"
    ADD CONSTRAINT "RawStockPeriod_pkey" PRIMARY KEY (id);


--
-- Name: RawUserAmount RawUserAmount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawUserAmount"
    ADD CONSTRAINT "RawUserAmount_pkey" PRIMARY KEY (id);


--
-- Name: TradingData TradingData_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TradingData"
    ADD CONSTRAINT "TradingData_pkey" PRIMARY KEY (id);


--
-- Name: UserBigItemInventory UserBigItemInventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBigItemInventory"
    ADD CONSTRAINT "UserBigItemInventory_pkey" PRIMARY KEY (id);


--
-- Name: UserSmallItemInventory UserSmallItemInventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSmallItemInventory"
    ADD CONSTRAINT "UserSmallItemInventory_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _RallyBigItemToRallySmallItem _RallyBigItemToRallySmallItem_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_RallyBigItemToRallySmallItem"
    ADD CONSTRAINT "_RallyBigItemToRallySmallItem_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: access_card_upgrade_cost access_card_upgrade_cost_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_card_upgrade_cost
    ADD CONSTRAINT access_card_upgrade_cost_pkey PRIMARY KEY (id);


--
-- Name: PeriodeTrading_periode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PeriodeTrading_periode_key" ON public."PeriodeTrading" USING btree (periode);


--
-- Name: RallyData_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RallyData_user_id_key" ON public."RallyData" USING btree (user_id);


--
-- Name: RallyPeriod_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "RallyPeriod_name_key" ON public."RallyPeriod" USING btree (name);


--
-- Name: TradingData_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "TradingData_userId_key" ON public."TradingData" USING btree ("userId");


--
-- Name: User_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_name_key" ON public."User" USING btree (name);


--
-- Name: _RallyBigItemToRallySmallItem_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_RallyBigItemToRallySmallItem_B_index" ON public."_RallyBigItemToRallySmallItem" USING btree ("B");


--
-- Name: BalanceTradingLog BalanceTradingLog_tradingDataId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BalanceTradingLog"
    ADD CONSTRAINT "BalanceTradingLog_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES public."TradingData"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftPeriod CraftPeriod_craftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftPeriod"
    ADD CONSTRAINT "CraftPeriod_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES public."CraftItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftPeriod CraftPeriod_periode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftPeriod"
    ADD CONSTRAINT "CraftPeriod_periode_fkey" FOREIGN KEY (periode) REFERENCES public."PeriodeTrading"(periode) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftRecipe CraftRecipe_craftItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftRecipe"
    ADD CONSTRAINT "CraftRecipe_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES public."CraftItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftRecipe CraftRecipe_rawItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftRecipe"
    ADD CONSTRAINT "CraftRecipe_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES public."RawItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftStockPeriod CraftStockPeriod_craftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftStockPeriod"
    ADD CONSTRAINT "CraftStockPeriod_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES public."CraftItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftStockPeriod CraftStockPeriod_periode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftStockPeriod"
    ADD CONSTRAINT "CraftStockPeriod_periode_fkey" FOREIGN KEY (periode) REFERENCES public."PeriodeTrading"(periode) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftUserAmount CraftUserAmount_craftItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftUserAmount"
    ADD CONSTRAINT "CraftUserAmount_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES public."CraftItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CraftUserAmount CraftUserAmount_tradingDataId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CraftUserAmount"
    ADD CONSTRAINT "CraftUserAmount_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES public."TradingData"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MapRecipeComponent MapRecipeComponent_craftItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MapRecipeComponent"
    ADD CONSTRAINT "MapRecipeComponent_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES public."CraftItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MapRecipeComponent MapRecipeComponent_mapRecipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MapRecipeComponent"
    ADD CONSTRAINT "MapRecipeComponent_mapRecipeId_fkey" FOREIGN KEY ("mapRecipeId") REFERENCES public."MapRecipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MasterTrading MasterTrading_current_periode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MasterTrading"
    ADD CONSTRAINT "MasterTrading_current_periode_fkey" FOREIGN KEY (current_periode) REFERENCES public."PeriodeTrading"(periode) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyActivityLog RallyActivityLog_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyActivityLog"
    ADD CONSTRAINT "RallyActivityLog_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyBigItemRecipe RallyBigItemRecipe_result_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyBigItemRecipe"
    ADD CONSTRAINT "RallyBigItemRecipe_result_item_id_fkey" FOREIGN KEY (result_item_id) REFERENCES public."RallyBigItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyBigItemRecipe RallyBigItemRecipe_small_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyBigItemRecipe"
    ADD CONSTRAINT "RallyBigItemRecipe_small_item_id_fkey" FOREIGN KEY (small_item_id) REFERENCES public."RallySmallItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyData RallyData_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyData"
    ADD CONSTRAINT "RallyData_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyMaster RallyMaster_current_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyMaster"
    ADD CONSTRAINT "RallyMaster_current_period_id_fkey" FOREIGN KEY (current_period_id) REFERENCES public."RallyPeriod"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyPos RallyPos_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyPos"
    ADD CONSTRAINT "RallyPos_period_id_fkey" FOREIGN KEY (period_id) REFERENCES public."RallyPeriod"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RallyPos RallyPos_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RallyPos"
    ADD CONSTRAINT "RallyPos_zone_id_fkey" FOREIGN KEY (zone_id) REFERENCES public."RallyZone"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawPeriod RawPeriod_periode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawPeriod"
    ADD CONSTRAINT "RawPeriod_periode_fkey" FOREIGN KEY (periode) REFERENCES public."PeriodeTrading"(periode) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawPeriod RawPeriod_rawId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawPeriod"
    ADD CONSTRAINT "RawPeriod_rawId_fkey" FOREIGN KEY ("rawId") REFERENCES public."RawItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawStockPeriod RawStockPeriod_periode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawStockPeriod"
    ADD CONSTRAINT "RawStockPeriod_periode_fkey" FOREIGN KEY (periode) REFERENCES public."PeriodeTrading"(periode) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawStockPeriod RawStockPeriod_rawId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawStockPeriod"
    ADD CONSTRAINT "RawStockPeriod_rawId_fkey" FOREIGN KEY ("rawId") REFERENCES public."RawItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawUserAmount RawUserAmount_rawItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawUserAmount"
    ADD CONSTRAINT "RawUserAmount_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES public."RawItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RawUserAmount RawUserAmount_tradingDataId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."RawUserAmount"
    ADD CONSTRAINT "RawUserAmount_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES public."TradingData"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TradingData TradingData_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TradingData"
    ADD CONSTRAINT "TradingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBigItemInventory UserBigItemInventory_big_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBigItemInventory"
    ADD CONSTRAINT "UserBigItemInventory_big_item_id_fkey" FOREIGN KEY (big_item_id) REFERENCES public."RallyBigItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBigItemInventory UserBigItemInventory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserBigItemInventory"
    ADD CONSTRAINT "UserBigItemInventory_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSmallItemInventory UserSmallItemInventory_small_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSmallItemInventory"
    ADD CONSTRAINT "UserSmallItemInventory_small_item_id_fkey" FOREIGN KEY (small_item_id) REFERENCES public."RallySmallItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSmallItemInventory UserSmallItemInventory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserSmallItemInventory"
    ADD CONSTRAINT "UserSmallItemInventory_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RallyBigItemToRallySmallItem _RallyBigItemToRallySmallItem_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_RallyBigItemToRallySmallItem"
    ADD CONSTRAINT "_RallyBigItemToRallySmallItem_A_fkey" FOREIGN KEY ("A") REFERENCES public."RallyBigItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _RallyBigItemToRallySmallItem _RallyBigItemToRallySmallItem_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_RallyBigItemToRallySmallItem"
    ADD CONSTRAINT "_RallyBigItemToRallySmallItem_B_fkey" FOREIGN KEY ("B") REFERENCES public."RallySmallItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: access_card_upgrade_cost access_card_upgrade_cost_big_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_card_upgrade_cost
    ADD CONSTRAINT access_card_upgrade_cost_big_item_id_fkey FOREIGN KEY (big_item_id) REFERENCES public."RallyBigItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: access_card_upgrade_cost access_card_upgrade_cost_small_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.access_card_upgrade_cost
    ADD CONSTRAINT access_card_upgrade_cost_small_item_id_fkey FOREIGN KEY (small_item_id) REFERENCES public."RallySmallItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict b1Rs3y5CYtxWTkOfHIbaKrvD7WuaB8lZ8iCUsXuSVa1eWkfWvQpb3Omal9nzhJv


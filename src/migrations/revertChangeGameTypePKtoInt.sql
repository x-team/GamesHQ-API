ALTER TABLE public."Game" DROP CONSTRAINT "Game__gameTypeId_fkey";
ALTER TABLE public."GameItemAvailability" DROP CONSTRAINT "GameItemAvailability__gameTypeId_fkey";
ALTER TABLE public."Achievement" DROP CONSTRAINT "Achievement__gameTypeId_fkey";

ALTER TABLE public."Game" ADD COLUMN "_gameTypeName" TEXT;
ALTER TABLE public."GameItemAvailability" ADD COLUMN "_gameTypeName" TEXT;
ALTER TABLE public."Achievement" ADD COLUMN "_gameTypeName" TEXT;

UPDATE public."Game" 
SET "_gameTypeName" = GT.name
FROM public."Game" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeId" = GT.id
where public."Game"."_gameTypeId" = GIA."_gameTypeId";

UPDATE public."GameItemAvailability" 
SET "_gameTypeName" = GT.name
FROM public."GameItemAvailability" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeId" = GT.id
where public."GameItemAvailability"."_gameTypeId" = GIA."_gameTypeId";

UPDATE public."Achievement" 
SET "_gameTypeName" = GT.name
FROM public."Achievement" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeId" = GT.id
where public."Achievement"."_gameTypeId" = GIA."_gameTypeId";

ALTER TABLE public."Game" DROP COLUMN "_gameTypeId";
ALTER TABLE public."GameItemAvailability" DROP COLUMN "_gameTypeId";
ALTER TABLE public."Achievement" DROP COLUMN "_gameTypeId";

ALTER TABLE public."Game" RENAME COLUMN "_gameTypeName" TO  "_gameTypeId";
ALTER TABLE public."GameItemAvailability" RENAME COLUMN "_gameTypeName" TO  "_gameTypeId";
ALTER TABLE public."Achievement" RENAME COLUMN "_gameTypeName" TO  "_gameTypeId";

ALTER TABLE public."GameType" DROP CONSTRAINT "GameType_pkey";
ALTER TABLE public."GameType" DROP CONSTRAINT "GameType_name_key";
ALTER TABLE public."GameType" DROP COLUMN id;
ALTER TABLE public."GameType" RENAME COLUMN name TO id;
ALTER table public."GameType" ADD PRIMARY KEY (id);

ALTER TABLE public."Game" 
ADD CONSTRAINT "Game__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."GameItemAvailability" 
ADD CONSTRAINT "GameItemAvailability__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Achievement" 
ADD CONSTRAINT "Achievement__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER table public."GameItemAvailability" ADD PRIMARY KEY ("_gameTypeId","_itemId");